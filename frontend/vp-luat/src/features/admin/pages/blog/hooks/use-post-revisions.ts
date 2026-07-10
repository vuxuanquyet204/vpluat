'use client';

import { useApiQuery } from '@/lib/api/hooks';
import type { Post } from '@/lib/api/admin-content';

export interface PostRevision {
  id: string;
  postId: string;
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  reason?: string;
  createdAt: string;
  revisionNumber?: number;
  changeNote?: string;
}

/**
 * Fetch post revisions for the given post. The list comes from
 * `GET /admin/posts/{id}/revisions` which returns a paginated payload
 * of PostRevisionDTO entries.
 */
export function usePostRevisions(postId: string): PostRevision[] {
  const { data } = useApiQuery<{
    content: Array<{
      id: string;
      postId: string;
      revisionNumber: number;
      snapshot: string;
      changeNote?: string;
      createdAt: string;
    }>;
    totalElements: number;
  }>(
    ['admin', 'post-revisions', postId],
    `/admin/posts/${postId}/revisions`,
    { page: 0, size: 50 },
    { enabled: Boolean(postId), retry: false },
  );

  return (data?.content ?? []).map((r) => ({
    id: r.id,
    postId: r.postId,
    reason: r.changeNote ?? 'edit',
    createdAt: r.createdAt,
    revisionNumber: r.revisionNumber,
    changeNote: r.changeNote,
    content: r.snapshot,
  }));
}
