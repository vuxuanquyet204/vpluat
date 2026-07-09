// features/news/hooks/use-news.ts
// React hooks for fetching posts/news from API

import { useQuery } from '@tanstack/react-query';
import { 
  getPosts, 
  getFeaturedPosts, 
  getPostBySlug, 
  getPostsByCategory,
  incrementPostViews,
  type PaginatedPostsResponse,
  type PostApiResponse 
} from '../api/news-api';

export function usePosts(page = 0, size = 20) {
  return useQuery<PaginatedPostsResponse | null, Error>({
    queryKey: ['posts', page, size],
    queryFn: () => getPosts(page, size),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeaturedPosts() {
  return useQuery<PostApiResponse[], Error>({
    queryKey: ['posts', 'featured'],
    queryFn: getFeaturedPosts,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePostBySlug(slug: string) {
  return useQuery<PostApiResponse | null, Error>({
    queryKey: ['posts', 'detail', slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePostsByCategory(categorySlug: string, page = 0, size = 20) {
  return useQuery<PaginatedPostsResponse | null, Error>({
    queryKey: ['posts', 'category', categorySlug, page, size],
    queryFn: () => getPostsByCategory(categorySlug, page, size),
    enabled: !!categorySlug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useIncrementPostViews() {
  return {
    mutate: (postId: string) => {
      incrementPostViews(postId);
    },
  };
}

// Hook for popular posts (most viewed)
export function usePopularPosts(limit = 5) {
  return useQuery<PostApiResponse[], Error>({
    queryKey: ['posts', 'popular', limit],
    queryFn: async () => {
      // Fetch all posts and sort by views
      const response = await getPosts(0, 50);
      if (!response) return [];
      return [...response.content]
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for all posts (for categories and tags count)
export function useAllPosts() {
  return useQuery<PostApiResponse[], Error>({
    queryKey: ['posts', 'all'],
    queryFn: async () => {
      const response = await getPosts(0, 100);
      if (!response) return [];
      return response.content;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for categories with counts
export interface CategoryWithCount {
  id: string;
  label: string;
  slug: string;
  count: number;
  icon: string;
}

export function useCategories() {
  return useQuery<CategoryWithCount[], Error>({
    queryKey: ['posts', 'categories'],
    queryFn: async () => {
      const posts = await getPosts(0, 200);
      if (!posts) {
        return [
          { id: 'all', label: 'Tất cả', slug: 'all', count: 0, icon: 'fa-solid fa-layer-group' },
        ];
      }
      
      // Count posts by category
      const categoryCounts: Record<string, number> = {};
      posts.content.forEach(post => {
        const cat = post.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      
      const totalCount = posts.content.length;
      
      return [
        { id: 'all', label: 'Tất cả', slug: 'all', count: totalCount, icon: 'fa-solid fa-layer-group' },
        { id: 'tin-tuc', label: 'Tin tức', slug: 'tin-tuc', count: categoryCounts['tin-tuc'] || 0, icon: 'fa-solid fa-newspaper' },
        { id: 'nghi-dinh', label: 'Nghị định', slug: 'nghi-dinh', count: categoryCounts['nghi-dinh'] || 0, icon: 'fa-solid fa-scale-balanced' },
        { id: 'blog', label: 'Blog', slug: 'blog', count: categoryCounts['blog'] || 0, icon: 'fa-solid fa-pen-nib' },
        { id: 'case-study', label: 'Case study', slug: 'case-study', count: categoryCounts['case-study'] || 0, icon: 'fa-solid fa-briefcase' },
        { id: 'huong-dan', label: 'Hướng dẫn', slug: 'huong-dan', count: categoryCounts['huong-dan'] || 0, icon: 'fa-solid fa-circle-info' },
      ];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for all tags
export function useAllTags() {
  return useQuery<string[], Error>({
    queryKey: ['posts', 'tags'],
    queryFn: async () => {
      const posts = await getPosts(0, 200);
      if (!posts) return [];
      
      // Extract all unique tags
      const tagSet = new Set<string>();
      posts.content.forEach(post => {
        post.tags?.forEach(tag => tagSet.add(tag));
      });
      
      return Array.from(tagSet).sort();
    },
    staleTime: 5 * 60 * 1000,
  });
}
