'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/lib/api/hooks';
import { postApi, type Post } from '@/lib/api/admin-content';

export interface UsePostsOptions {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'all';
  category?: string | 'all';
  tag?: string;
  search?: string;
  author?: string;
}

function mapPost(p: Post) {
  return {
    ...p,
    // compatibility aliases used by older UI components
    title: p.title ?? '',
    excerpt: p.excerpt ?? '',
    content: p.content ?? '',
    author: p.authorName ?? p.authorId,
    category: p.categoryId,
    thumbnail: p.thumbnailUrl ?? '',
    tags: (p as unknown as { tags?: string[] }).tags ?? [],
  };
}

export function usePosts(options: UsePostsOptions = {}): Array<Post & { title: string; author: string; category?: string; tags: string[] }> {
  const { data } = useApiQuery<{ content: Post[]; totalElements: number }>(
    ['admin', 'posts', JSON.stringify(options)],
    '/admin/posts',
    {
      page: 0,
      size: 200,
      status: options.status && options.status !== 'all' ? options.status : undefined,
      categoryId: options.category && options.category !== 'all' ? options.category : undefined,
      search: options.search || undefined,
    },
  );
  const list = (data?.content ?? []).map(mapPost);

  return useMemo(() => {
    let result = list;
    if (options.tag) {
      result = result.filter((p) => (p as unknown as { tags: string[] }).tags?.includes(options.tag!));
    }
    if (options.author) {
      result = result.filter((p) => p.author === options.author);
    }
    return result;
  }, [list, options.tag, options.author]);
}