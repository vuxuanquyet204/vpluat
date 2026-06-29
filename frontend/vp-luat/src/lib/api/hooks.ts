// lib/api/hooks.ts
// Thin React Query hooks that wrap the existing axios client.
// Replace `useMockQuery` with these in admin pages.

'use client';

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { apiClient } from './client';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<ApiEnvelope<T>>(url, { params });
  return unwrap(res.data);
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<ApiEnvelope<T>>(url, body);
  return unwrap(res.data);
}

async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.patch<ApiEnvelope<T>>(url, body);
  return unwrap(res.data);
}

async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<ApiEnvelope<T>>(url, body);
  return unwrap(res.data);
}

async function del<T>(url: string): Promise<T> {
  const res = await apiClient.delete<ApiEnvelope<T>>(url);
  return unwrap(res.data);
}

function unwrap<T>(env: ApiEnvelope<T>): T {
  if (!env.success && env.error) {
    throw new Error(env.error);
  }
  return env.data as T;
}

export function useApiQuery<T>(
  key: readonly unknown[],
  url: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, AxiosError>({
    queryKey: [...key, params ?? {}],
    queryFn: () => get<T>(url, params),
    ...options,
  });
}

export function useApiMutation<T, V = unknown>(
  method: 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  url: string | ((vars: V) => string),
  options?: UseMutationOptions<T, AxiosError, V>,
) {
  return useMutation<T, AxiosError, V>({
    mutationFn: async (vars: V) => {
      const target = typeof url === 'function' ? url(vars) : url;
      if (method === 'POST') return post<T>(target, vars);
      if (method === 'PATCH') return patch<T>(target, vars);
      if (method === 'PUT') return put<T>(target, vars);
      return del<T>(target);
    },
    ...options,
  });
}

export const api = { get, post, patch, put, del };
