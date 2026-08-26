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
  // Convert the flat BE payload (metaTitle/metaDesc/ogImageUrl) into the
  // nested `seo` envelope that the legacy BlogPost type expects. Without
  // this remap the editor's `buildInitialState` reads `undefined` for every
  // SEO field, so opening an existing post for edit blanks the form.
  const seo = {
    metaTitle: p.metaTitle ?? '',
    metaDescription: p.metaDesc ?? '',
    ogImage: p.ogImageUrl ?? '',
    canonical: '',
    noindex: false,
  };
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
    seo,
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
    },
  );
  const list = (data?.content ?? []).map(mapPost);

  return useMemo(() => {
    const query = options.search?.trim().toLowerCase();
    let result = list;
    if (query) {
      result = result.filter((post) =>
        [post.title, post.excerpt, post.slug].some((value) => value.toLowerCase().includes(query)),
      );
    }
    if (options.category && options.category !== 'all') {
      result = result.filter((post) => post.categoryId === options.category);
    }
    if (options.tag) {
      result = result.filter((p) => (p as unknown as { tags: string[] }).tags?.includes(options.tag!));
    }
    if (options.author) {
      result = result.filter((p) => p.author === options.author || p.authorId === options.author);
    }
    return result;
  }, [list, options.author, options.category, options.search, options.tag]);
}