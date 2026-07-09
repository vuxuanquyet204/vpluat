// features/home/api/reviews-api.ts
// API client for public reviews endpoints

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

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

function mapReviewDto(dto: ReviewDTO): ReviewApiResponse {
  const nameParts = dto.clientName?.split(' ') || [];
  const initials = nameParts.length > 1
    ? nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : dto.clientName?.slice(0, 2).toUpperCase() || 'CL';
    
  return {
    id: dto.id,
    clientName: dto.clientName || 'Khách hàng',
    clientRole: dto.clientRole || '',
    content: dto.content || '',
    rating: dto.rating || 5,
    lawyerId: dto.lawyerId,
    lawyerName: dto.lawyerName,
    serviceId: dto.serviceId,
    serviceName: dto.serviceName,
    isFeatured: dto.isFeatured || false,
    initials,
    avatarColor: 'linear-gradient(135deg, #1E3A5F, #C9A84C)',
  };
}

export async function getReviews(): Promise<ReviewApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ReviewDTO[]>>('/public/reviews');
    if (data.success && data.data) {
      return data.data.map(mapReviewDto);
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
      return data.data.map(mapReviewDto);
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
      return data.data.map(mapReviewDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch recent reviews:', error);
    return [];
  }
}
