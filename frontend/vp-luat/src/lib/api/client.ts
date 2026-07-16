// lib/api/client.ts
// Client-side API client with JWT Bearer auth

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Store token in memory for client-side use
let cachedToken: string | null = null;

export function setAuthToken(token: string | null) {
  cachedToken = token;
  if (typeof window !== 'undefined' && token) {
    try {
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
      window.localStorage.removeItem('brs_refresh_token');
    } catch {
      // ignore
    }
  }
}

function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      window.localStorage.setItem('brs_refresh_token', token);
    } else {
      window.localStorage.removeItem('brs_refresh_token');
    }
  } catch {
    // ignore
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('brs_refresh_token');
  } catch {
    return null;
  }
}

// Interceptor: attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  // Always re-read token from localStorage to support multi-tab / reload
  // (cachedToken is set on sign-in but can be lost on hard refresh).
  let token: string | null = cachedToken;
  if (!token && typeof window !== 'undefined') {
    try {
      token = window.localStorage.getItem('brs_access_token');
      if (token) cachedToken = token;
    } catch {
      // ignore
    }
  }

  // Fallback: lay token tu NextAuth session neu localStorage rong
  // (xay ra khi setAuthToken() duoc goi o server-side authorize() nen
  // localStorage chua duoc populate; refresh page se xoa in-memory cache).
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
      // ignore - request will be sent without token (will get 401/403)
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
// every subsequent 401 and just go straight to login. Without this guard,
// React Query's default 3x retry storms the auth endpoint and the user
// sees a constant "verifying" spinner.
let refreshPermanentlyFailed = false;

// Coalesce concurrent 401/403 responses into a single refresh attempt so we
// don't fire N parallel /auth/refresh calls when a stale token fans out to
// every parallel query in the page.
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    if (typeof console !== 'undefined') {
      console.warn('[auth] no refresh token in localStorage');
    }
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
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
    const newRefresh: string | null = data?.refreshToken ?? null;
    if (!newAccess) {
      if (typeof console !== 'undefined') {
        console.warn('[auth] refresh response missing accessToken', json);
      }
      return null;
    }
    setAuthToken(newAccess);
    if (newRefresh) setRefreshToken(newRefresh);
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
  // Avoid pushing /login if we're already there (would otherwise loop).
  const onLogin = window.location.pathname.startsWith('/login');
  if (onLogin) {
    // If we somehow landed back on /login while already authenticated,
    // hard reset by clearing local state and forcing a reload.
    clearAuthToken();
    return;
  }
  // Lock out further refresh attempts on this page.
  refreshPermanentlyFailed = true;
  refreshInFlight = null;
  // Drop NextAuth session cookie + local tokens before navigating, otherwise
  // the proxy.ts sees the stale JWT cookie and bounces the user right back
  // to /admin, creating an infinite /admin → 401 → /login → /admin loop.
  clearAuthToken();
  try {
    const { signOut } = await import('next-auth/react');
    // Default redirect:true makes NextAuth fully wipe its own cookie AND
    // navigate — by passing /login as callbackUrl we land there cleanly
    // regardless of what proxy.ts decides about session state.
    await signOut({ callbackUrl: '/login?forceLogin=1' });
  } catch {
    // Fall back to a manual navigation if signOut itself throws.
    window.location.replace(
      `/login?forceLogin=1&callbackUrl=${encodeURIComponent(window.location.pathname)}`,
    );
  }
}

// Response interceptor: handle 401/403 (token expired or revoked) by
// silently refreshing the access token and replaying the original request
// once. If the refresh itself fails, redirect to login.
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

    // Don't try to refresh on the refresh endpoint itself — it would loop.
    const reqUrl = String(originalRequest?.url ?? '');
    const isRefreshCall =
      reqUrl.endsWith('/auth/refresh') || reqUrl.includes('/auth/refresh?');

    if (!originalRequest || originalRequest._retried || isRefreshCall) {
      if (typeof console !== 'undefined' && !isLoggingOut) {
        console.debug('[auth] skip refresh', {
          url: reqUrl,
          retried: originalRequest?._retried,
          isRefreshCall,
        });
      }
      return Promise.reject(error);
    }

    if (status !== 401 && status !== 403) {
      return Promise.reject(error);
    }

    // If a previous refresh on this page already failed, don't keep
    // hammering the auth endpoint — every React Query retry would just
    // trigger another 401/403 loop.
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

    // Replay the original request once with the freshly minted token.
    originalRequest._retried = true;
    originalRequest.headers = originalRequest.headers ?? ({} as import('axios').AxiosHeaders);
    (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
    try {
      return await apiClient.request(originalRequest);
    } catch (retryErr) {
      // If the retry still fails with 401/403, the new token was rejected too —
      // bail out to login instead of looping.
      const retryStatus = (retryErr as { response?: { status?: number } })?.response?.status;
      if (retryStatus === 401 || retryStatus === 403) {
        clearAuthToken();
        await redirectToLogin();
      }
      return Promise.reject(retryErr);
    }
  },
);
