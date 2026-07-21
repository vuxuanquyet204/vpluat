// lib/api/client.ts
// Client-side API client with JWT Bearer auth + HttpOnly cookie for refresh token
//
// Token strategy:
// - Access token  (15 min):  stored in memory (cachedToken) + localStorage fallback.
//                           Sent via Authorization: Bearer header.
// - Refresh token (7 days):  stored in an HttpOnly, SameSite=Lax cookie by the
//                           backend on login/refresh.  The browser attaches it
//                           automatically to same-origin requests when
//                           credentials: 'include' is set.
//
// This approach removes the XSS risk for the refresh token (it can never be
// read by JavaScript) while keeping the access-token-in-header flow that the
// existing client code already relies on.

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  // Instruct the browser to include cookies in cross-origin requests so the
  // HttpOnly refresh-token cookie is sent automatically.
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Store the short-lived access token in memory so it can be attached to
// outgoing requests without hitting localStorage on every call.
let cachedToken: string | null = null;

export function setAuthToken(token: string | null) {
  cachedToken = token;
  if (typeof window !== 'undefined' && token) {
    try {
      // Keep the access token in localStorage as a fallback for hard refreshes
      // (the in-memory cache is lost on full-page reload).
      window.localStorage.setItem('brs_access_token', token);
    } catch {
      // ignore quota/privacy errors
    }
  }
  // A freshly issued token means we should be willing to refresh again if
  // it later expires.
  refreshPermanentlyFailed = false;
}

export function getAuthToken(): string | null {
  if (cachedToken) return cachedToken;
  if (typeof window !== 'undefined') {
    try {
      cachedToken = window.localStorage.getItem('brs_access_token');
    } catch {
      return null;
    }
  }
  return cachedToken;
}

export function clearAuthToken() {
  cachedToken = null;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('brs_access_token');
      // brs_refresh_token is now in an HttpOnly cookie — it is NOT cleared
      // here because JS cannot delete it. The backend clears it on logout
      // by sending Set-Cookie: brs_refresh_token=; Max-Age=0.
    } catch {
      // ignore
    }
  }
}

/**
 * Best-effort logout: call BE to revoke the refresh-token in Redis + clear the
 * HttpOnly cookie.  Silently swallows network errors so the caller (NextAuth
 * signOut) can always complete the local logout flow regardless of the
 * network state.
 */
export async function callServerLogout(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',           // send the HttpOnly cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),         // body is optional — fallback to cookie
    });
  } catch {
    // Network / server down — local logout still proceeds.
  }
}

// NOTE: setRefreshToken() / getRefreshToken() for localStorage have been
// removed.  The refresh token now lives in an HttpOnly cookie set by the
// backend.  The browser sends it automatically on every request because
// apiClient and the fetch call below both use credentials: 'include'.

// Interceptor: attach JWT access token to every request via Bearer header.
// The refresh token is NOT handled here — it is handled automatically by the
// browser's cookie mechanism.
apiClient.interceptors.request.use(async (config) => {
  // Re-read token from localStorage on hard refresh
  // (cachedToken is lost on full-page reload).
  let token: string | null = cachedToken;
  if (!token && typeof window !== 'undefined') {
    try {
      token = window.localStorage.getItem('brs_access_token');
      if (token) cachedToken = token;
    } catch {
      // ignore
    }
  }

  // Fallback: pull token from NextAuth session when localStorage is empty.
  // This can happen when setAuthToken() runs on the server during SSR.
  if (!token && typeof window !== 'undefined') {
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      const sessionToken = (session?.user as { accessToken?: string } | null)?.accessToken;
      if (sessionToken) {
        token = sessionToken;
        cachedToken = token;
        try {
          window.localStorage.setItem('brs_access_token', token);
        } catch {
          // ignore quota/privacy errors
        }
      }
    } catch {
      // ignore — request will be sent without token (will get 401/403)
    }
  }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to suppress 401-triggered sign-in redirect during logout flow
let isLoggingOut = false;
export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

// When the refresh endpoint itself rejects, we know for the rest of this
// page lifecycle that no refresh token can save us — so stop trying on
// every subsequent 401 and just go straight to login.
let refreshPermanentlyFailed = false;

// Coalesce concurrent 401/403 responses into a single refresh attempt so we
// don't fire N parallel /auth/refresh calls when a stale token fans out to
// every parallel query in the page.
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Refresh the access token using the HttpOnly refresh-token cookie.
 *
 * The browser automatically includes the cookie because we set
 * `credentials: 'include'` on the fetch call.  No localStorage access needed.
 */
async function performRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // This is critical: it tells the browser to include the HttpOnly cookie.
      credentials: 'include',
      // No body needed — the backend reads the refresh token from the cookie.
    });

    if (!res.ok) {
      if (typeof console !== 'undefined') {
        console.warn('[auth] refresh HTTP', res.status, await res.text().catch(() => ''));
      }
      return null;
    }

    const json = await res.json();
    const data = json?.data ?? json;
    const newAccess: string | null = data?.accessToken ?? null;

    if (!newAccess) {
      if (typeof console !== 'undefined') {
        console.warn('[auth] refresh response missing accessToken', json);
      }
      return null;
    }

    // Store the new access token (the refresh token is rotated by the backend
    // via the Set-Cookie header — handled by the browser automatically).
    setAuthToken(newAccess);
    return newAccess;
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.warn('[auth] refresh threw', e);
    }
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = performRefresh().finally(() => {
    setTimeout(() => {
      refreshInFlight = null;
    }, 0);
  });
  return refreshInFlight;
}

async function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const onLogin = window.location.pathname.startsWith('/login');
  if (onLogin) {
    clearAuthToken();
    return;
  }
  refreshPermanentlyFailed = true;
  refreshInFlight = null;
  clearAuthToken();
  try {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/login?forceLogin=1' });
  } catch {
    window.location.replace(
      `/login?forceLogin=1&callbackUrl=${encodeURIComponent(window.location.pathname)}`,
    );
  }
}

// Response interceptor: handle 401/403 (token expired or revoked) by
// silently refreshing the access token and replaying the original request.
// The refresh uses the HttpOnly cookie automatically.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window === 'undefined' || isLoggingOut) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const originalRequest = error.config as
      | (import('axios').InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    const reqUrl = String(originalRequest?.url ?? '');
    const isRefreshCall =
      reqUrl.endsWith('/auth/refresh') || reqUrl.includes('/auth/refresh?');

    if (!originalRequest || originalRequest._retried || isRefreshCall) {
      return Promise.reject(error);
    }

    if (status !== 401 && status !== 403) {
      return Promise.reject(error);
    }

    if (refreshPermanentlyFailed) {
      return Promise.reject(error);
    }

    if (typeof console !== 'undefined') {
      console.debug('[auth] 401/403 received, attempting refresh', reqUrl);
    }

    const newToken = await refreshAccessToken();
    if (!newToken) {
      refreshPermanentlyFailed = true;
      if (typeof console !== 'undefined') {
        console.warn('[auth] refresh failed, redirecting to login');
      }
      await redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retried = true;
    originalRequest.headers = originalRequest.headers ?? ({} as import('axios').AxiosHeaders);
    (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
    try {
      return await apiClient.request(originalRequest);
    } catch (retryErr) {
      const retryStatus = (retryErr as { response?: { status?: number } })?.response?.status;
      if (retryStatus === 401 || retryStatus === 403) {
        clearAuthToken();
        await redirectToLogin();
      }
      return Promise.reject(retryErr);
    }
  },
);
