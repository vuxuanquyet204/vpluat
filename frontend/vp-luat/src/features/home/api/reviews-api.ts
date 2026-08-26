// features/home/api/reviews-api.ts
// API client for public reviews endpoints

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import { getDisplayLabel } from '@/lib/display-labels';

export interface ReviewDTO {
  id: string;
  clientName?: string;
  clientRole?: string;
  content?: string;
  rating?: number;
  lawyerId?: string;
  lawyerName?: string;
  serviceId?: string;
  serviceName?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  source?: string;
  createdAt?: string;
}

export interface ReviewApiResponse {
  id: string;
  clientName: string;
  clientRole: string;
  content: string;
  rating: number;
  lawyerId?: string;
  lawyerName?: string;
  serviceId?: string;
  serviceName?: string;
  isFeatured: boolean;
  initials?: string;
  avatarColor?: string;
}

function mapReviewDto(dto: ReviewDTO): ReviewApiResponse | null {
  const nameParts = dto.clientName?.split(' ') || [];
  const initials = nameParts.length > 1
    ? nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : dto.clientName?.slice(0, 2).toUpperCase() || 'CL';

  // Backend's ReviewMapper doesn't currently populate `content` (the entity
  // stores `contentVi` / `contentEn` but the mapper ignores them). Filter
  // reviews without content out so the testimonials UI never shows blanks.
  const trimmedContent = (dto.content ?? '').trim();
  if (!trimmedContent) {
    return null;
  }

  // BE maps `serviceName` from `service.slug`; turn the slug into a
  // human-readable label so the UI doesn't show raw kebab-case identifiers.
  const rawServiceName = dto.serviceName ?? '';
  const looksLikeSlug = /[-_]/.test(rawServiceName) && rawServiceName === rawServiceName.toLowerCase();
  const serviceDisplayName = looksLikeSlug
    ? getDisplayLabel(rawServiceName, 'Dịch vụ')
    : rawServiceName;

  return {
    id: dto.id,
    clientName: dto.clientName || 'Khách hàng',
    clientRole: dto.clientRole || '',
    content: trimmedContent,
    rating: dto.rating || 5,
    lawyerId: dto.lawyerId,
    lawyerName: dto.lawyerName,
    serviceId: dto.serviceId,
    serviceName: serviceDisplayName,
    isFeatured: dto.isFeatured || false,
    initials,
    avatarColor: 'linear-gradient(135deg, #1E3A5F, #C9A84C)',
  };
}

function mapAndFilter<T extends { id: string }, U>(
  items: T[] | undefined,
  map: (dto: T) => U | null,
): U[] {
  if (!Array.isArray(items)) return [];
  const result: U[] = [];
  for (const item of items) {
    const mapped = map(item);
    if (mapped !== null) {
      result.push(mapped);
    }
  }
  return result;
}

export async function getReviews(): Promise<ReviewApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ReviewDTO[]>>('/public/reviews');
    if (data.success && data.data) {
      return mapAndFilter(data.data, mapReviewDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}

export async function getFeaturedReviews(): Promise<ReviewApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ReviewDTO[]>>('/public/reviews/featured');
    if (data.success && data.data) {
      return mapAndFilter(data.data, mapReviewDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch featured reviews:', error);
    return [];
  }
}

export async function getRecentReviews(limit = 10): Promise<ReviewApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ReviewDTO[]>>('/public/reviews/recent', {
      params: { limit },
    });
    if (data.success && data.data) {
      return mapAndFilter(data.data, mapReviewDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch recent reviews:', error);
    return [];
  }
}
