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
import { useMemo } from 'react';
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

/**
 * Deep stable stringify used to build a deterministic query key from a params
 * object. This is critical to prevent an infinite refetch loop: if we put the
 * raw params object in the queryKey, React Query sees a new reference on every
 * render, treats it as a new key, refetches, re-renders, and the cycle repeats
 * — burning CPU and RAM.
 */
function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + stableStringify((value as Record<string, unknown>)[k]))
      .join(',') +
    '}'
  );
}

export function useApiQuery<T>(
  key: readonly unknown[],
  url: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  // Memoise the stringified key so the reference is stable across renders
  // even when the caller passes a fresh object literal.
  const serializedParams = useMemo(() => stableStringify(params ?? {}), [params]);

  return useQuery<T, AxiosError>({
    queryKey: [...key, serializedParams],
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
      if (method === 'PATCH') {
        // PATCH body must not include the id field (it's already in the URL).
        const { id: _id, ...body } = vars as { id?: string } & Record<string, unknown>;
        return patch<T>(target, body);
      }
      if (method === 'PUT') return put<T>(target, vars);
      return del<T>(target);
    },
    ...options,
  });
}

export const api = { get, post, patch, put, del };