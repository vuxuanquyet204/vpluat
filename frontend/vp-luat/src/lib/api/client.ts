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

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !isLoggingOut
    ) {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      if (!session) {
        const { signIn } = await import('next-auth/react');
        signIn(undefined, { callbackUrl: window.location.pathname });
      }
    }
    return Promise.reject(error);
  }
);
