// features/news/api/news-api.ts
// API client for public posts/news endpoints

import { apiClient } from '@/lib/api/client';
import type { ApiResponse, PageResponse } from '@/types/api';
import { getDisplayLabel } from '@/lib/display-labels';

export interface PostDTO {
  id: string;
  slug: string;
  thumbnailUrl?: string;
  authorId?: string;
  authorName?: string;
  categoryId?: string;
  categoryName?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  status?: string;
  publishedAt?: { toString: () => string } | string;
  scheduledAt?: string;
  views?: number;
  readingTime?: number;
  ogImageUrl?: string;
  isFeatured?: boolean;
  language?: string;
  metaTitle?: string;
  metaDesc?: string;
  tags?: string[];
  lawyerIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PostApiResponse {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryName?: string;
  tags: string[];
  author: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  thumbnail?: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  isHot?: boolean;
  isFeatured?: boolean;
}

export interface PaginatedPostsResponse {
  content: PostApiResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

function mapPostDto(dto: PostDTO): PostApiResponse {
  const authorInitials = dto.authorName
    ? dto.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  let publishedAt = '';
  if (dto.publishedAt) {
    if (typeof dto.publishedAt === 'string') {
      publishedAt = dto.publishedAt;
    } else if (dto.publishedAt && typeof dto.publishedAt.toString === 'function') {
      publishedAt = dto.publishedAt.toString();
    }
  }
  if (!publishedAt) {
    publishedAt = new Date().toISOString();
  }

  // BE PostMapper currently maps `categoryName` from `category.slug` rather
  // than a display name. Treat the slug as the category identifier and surface
  // the raw value so the UI can decide how to render it (e.g. capitalize
  // after the hyphen, or look up the human label).
  const rawCategoryName = dto.categoryName ?? '';
  const looksLikeSlug = /[-_]/.test(rawCategoryName) && rawCategoryName === rawCategoryName.toLowerCase();
  const categoryDisplayName = looksLikeSlug
    ? getDisplayLabel(rawCategoryName, 'Tin tức')
    : rawCategoryName || 'Tin tức';

  return {
    id: dto.id,
    slug: dto.slug || '',
    title: dto.title || '',
    excerpt: dto.excerpt || '',
    content: dto.content || '',
    category: rawCategoryName.toLowerCase().replace(/\s+/g, '-') || 'tin-tuc',
    categoryName: categoryDisplayName,
    tags: Array.isArray((dto as unknown as Record<string, unknown>).tags) ? ((dto as unknown as Record<string, unknown>).tags as string[]) : [],
    author: {
      name: dto.authorName || 'Author',
      initials: authorInitials,
      avatarColor: 'linear-gradient(135deg, #1E3A5F, #C9A84C)',
    },
    thumbnail: dto.thumbnailUrl,
    publishedAt,
    readingTime: dto.readingTime || 5,
    views: dto.views || 0,
    isHot: !!(dto.views && dto.views > 1000),
    isFeatured: dto.isFeatured || false,
  };
}

export async function getPosts(page = 0, size = 20): Promise<PaginatedPostsResponse | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<PageResponse<PostDTO>>>('/public/posts', {
      params: { page, size },
    });
    if (data.success && data.data) {
      return {
        content: data.data.content.map(mapPostDto),
        page: data.data.page,
        size: data.data.size,
        totalElements: data.data.totalElements,
        totalPages: data.data.totalPages,
        first: data.data.first,
        last: data.data.last,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return null;
  }
}

export async function getFeaturedPosts(): Promise<PostApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<PostDTO[]>>('/public/posts/featured');
    if (data.success && data.data) {
      return data.data.map(mapPostDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch featured posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostApiResponse | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<PostDTO>>(`/public/posts/${slug}`);
    if (data.success && data.data) {
      return mapPostDto(data.data);
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function getPostsByCategory(categorySlug: string, page = 0, size = 20): Promise<PaginatedPostsResponse | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<PageResponse<PostDTO>>>(`/public/posts/category/${categorySlug}`, {
      params: { page, size },
    });
    if (data.success && data.data) {
      return {
        content: data.data.content.map(mapPostDto),
        page: data.data.page,
        size: data.data.size,
        totalElements: data.data.totalElements,
        totalPages: data.data.totalPages,
        first: data.data.first,
        last: data.data.last,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch posts by category:', error);
    return null;
  }
}

export async function getRelatedPosts(postId: string, limit = 5): Promise<PostApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<PostDTO[]>>(
      `/public/posts/${encodeURIComponent(postId)}/related`,
      { params: { limit } },
    );
    return data.success && data.data ? data.data.map(mapPostDto) : [];
  } catch (error) {
    console.error('Failed to fetch related posts:', error);
    return [];
  }
}

export async function searchPublicContent(
  query: string,
  type?: string,
  language = 'vi',
): Promise<Array<{ type: string; id: string; title: string; excerpt?: string; slug?: string; url?: string }>> {
  const { data } = await apiClient.get<ApiResponse<Array<{
    type: string;
    id: string;
    title: string;
    excerpt?: string;
    slug?: string;
    url?: string;
  }>>>('/public/search', { params: { query, type, language } });
  return data.success && data.data ? data.data : [];
}

export async function incrementPostViews(postId: string): Promise<void> {
  try {
    await apiClient.post(`/public/posts/${postId}/view`);
  } catch (error) {
    console.error('Failed to increment post views:', error);
  }
}
