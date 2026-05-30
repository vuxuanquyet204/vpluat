// lib/api/client.ts
// Client-side API client with HttpOnly cookie auth

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: Handle 401 errors
// For NextAuth v5, token refresh is handled automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Let NextAuth handle redirect to login
      // The middleware will catch this and redirect
      console.warn('Unauthorized request - NextAuth will handle refresh');
    }
    return Promise.reject(error);
  }
);
