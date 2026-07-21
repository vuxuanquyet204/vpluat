// features/services/api/services-api.ts
// API client for public services endpoints

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

export interface ServiceDTO {
  id: string;
  parentId?: string;
  slug?: string;
  name?: string;
  icon?: string;
  title?: string;
  titleEn?: string;
  excerpt?: string;
  excerptEn?: string;
  content?: string;
  contentEn?: string;
  metaTitle?: string;
  metaTitleEn?: string;
  metaDesc?: string;
  metaDescEn?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  parentName?: string;
}

export interface ServiceApiResponse {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  price?: number;
  duration?: string;
  icon: string;
  color?: string;
  features?: string[];
  lawyerId?: string;
  lawyerIds?: string[];
  benefits?: string[];
  popular?: boolean;
  isFeatured?: boolean;
  parentName?: string;
}

function mapServiceDto(dto: ServiceDTO): ServiceApiResponse {
  return {
    id: dto.id,
    slug: dto.slug || '',
    name: dto.name || dto.title || '',
    shortDescription: dto.excerpt || dto.title || '',
    description: dto.content || '',
    category: dto.parentName?.toLowerCase().replace(/\s+/g, '-') || 'other',
    icon: dto.icon ? `fa-solid fa-${dto.icon}` : 'fa-solid fa-gavel',
    isFeatured: dto.isFeatured || false,
    parentName: dto.parentName,
  };
}

export async function getServices(): Promise<ServiceApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ServiceDTO[]>>('/public/services');
    if (data.success && data.data) {
      return data.data.map(mapServiceDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

export async function getFeaturedServices(): Promise<ServiceApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ServiceDTO[]>>('/public/services/featured');
    if (data.success && data.data) {
      return data.data.map(mapServiceDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch featured services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceApiResponse | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<ServiceDTO>>(`/public/services/${slug}`);
    if (data.success && data.data) {
      return mapServiceDto(data.data);
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch service:', error);
    return null;
  }
}
