'use client';

import { useMemo } from 'react';
import { useMockQuery } from '../../../lib/use-mock-query';
import type { PostRevision } from '../../../types';

export function usePostRevisions(postId: string): PostRevision[] {
  const { data = [] } = useMockQuery<PostRevision>('post_revisions');
  return useMemo(
    () => data.filter((r) => r.postId === postId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data, postId],
  );
}
