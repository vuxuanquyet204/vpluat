'use client';

import { useMemo } from 'react';
import { useMockQuery } from '../../../lib/use-mock-query';
import type { BlogPost, PostStatus } from '../../../types';

export interface UsePostsOptions {
  status?: PostStatus | 'all';
  category?: string | 'all';
  tag?: string;
  search?: string;
  author?: string;
}

export function usePosts(options: UsePostsOptions = {}): BlogPost[] {
  const { data = [] } = useMockQuery<BlogPost>('posts');
  return useMemo(() => {
    let result = data;
    if (options.status && options.status !== 'all') {
      result = result.filter((p) => p.status === options.status);
    }
    if (options.category && options.category !== 'all') {
      result = result.filter((p) => p.category === options.category);
    }
    if (options.tag) {
      result = result.filter((p) => p.tags.includes(options.tag!));
    }
    if (options.author) {
      result = result.filter((p) => p.author === options.author);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, options.status, options.category, options.tag, options.author, options.search]);
}
