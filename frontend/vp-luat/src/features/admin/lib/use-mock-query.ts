/**
 * useMockQuery — wrapper TanStack Query cho MockDB.
 * Subscribe vào MockDB để auto-invalidate khi DB thay đổi.
 */

'use client';

import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { MockDB, type CollectionName } from '../mock/db';

export const mockQueryKey = (collection: CollectionName, params?: unknown) =>
  ['admin', collection, params ?? {}] as const;

export function useMockQuery<T extends object>(
  collection: CollectionName,
  filter?: (record: T) => boolean,
  sort?: { by: keyof T; dir: 'asc' | 'desc' },
  options?: Omit<UseQueryOptions<T[]>, 'queryKey' | 'queryFn'>,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return MockDB.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', collection] });
    });
  }, [collection, queryClient]);

  return useQuery<T[]>({
    queryKey: mockQueryKey(collection, { filter: filter?.toString(), sort }),
    queryFn: () => Promise.resolve(MockDB.query<T>(collection, filter, sort)),
    ...options,
  });
}

export function useMockDoc<T extends object>(
  collection: CollectionName,
  id: string | null | undefined,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return MockDB.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', collection] });
    });
  }, [collection, queryClient]);

  return useQuery<T | null>({
    queryKey: mockQueryKey(collection, { id }),
    queryFn: () => Promise.resolve(id ? MockDB.getById<T>(collection, id) : null),
    enabled: Boolean(id),
  });
}
