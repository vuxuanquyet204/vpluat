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
    } catch {
      // ignore
    }
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

// Coalesce concurrent 401/403 responses into a single sign-out flow so we
// don't spam the auth provider when every parallel query fails at once.
let authFailureInFlight: Promise<void> | null = null;
let lastAuthFailureAt = 0;
const AUTH_FAILURE_DEDUPE_MS = 2000;

async function handleAuthFailure(reason: '401' | '403'): Promise<void> {
  if (typeof window === 'undefined' || isLoggingOut) return;

  const now = Date.now();
  // Skip if a recent failure already kicked off the sign-out flow.
  if (authFailureInFlight && now - lastAuthFailureAt < AUTH_FAILURE_DEDUPE_MS) {
    return authFailureInFlight;
  }
  lastAuthFailureAt = now;

  authFailureInFlight = (async () => {
    try {
      // Drop the stale token immediately so subsequent requests don't keep
      // re-attaching it.
      clearAuthToken();

      // Try to refresh via NextAuth; if there's no session at all, sign in.
      const { getSession } = await import('next-auth/react');
      const session = await getSession();

      if (session) {
        const sessionToken = (session.user as { accessToken?: string } | null)?.accessToken;
        if (sessionToken) {
          setAuthToken(sessionToken);
          return;
        }
      }

      const { signIn } = await import('next-auth/react');
      signIn(undefined, { callbackUrl: window.location.pathname });
    } catch {
      // Best-effort: if anything fails, fall through and let the caller
      // observe the rejected error.
    } finally {
      // Allow a new failure flow after the dedupe window so users can
      // retry once the auth state settles.
      setTimeout(() => {
        authFailureInFlight = null;
      }, AUTH_FAILURE_DEDUPE_MS);
    }
  })();

  return authFailureInFlight;
}

// Response interceptor: handle 401/403 (token expired or revoked)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (typeof window !== 'undefined' && !isLoggingOut) {
      if (status === 401) {
        await handleAuthFailure('401');
      } else if (status === 403) {
        // 403 from a backend using stateless JWT almost always means the
        // access token is expired/revoked and the security context fell
        // back to anonymous. Treat the same as 401 to recover gracefully.
        await handleAuthFailure('403');
      }
    }
    return Promise.reject(error);
  }
);
