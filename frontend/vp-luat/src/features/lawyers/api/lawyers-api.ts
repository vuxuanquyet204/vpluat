// features/lawyers/api/lawyers-api.ts
// API client for public lawyers endpoints

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

export interface LawyerDTO {
  id: string;
  userId?: string;
  userEmail?: string;
  phone?: string;
  slug?: string;
  nameVi?: string;
  nameEn?: string;
  bioVi?: string;
  bioEn?: string;
  positionVi?: string;
  positionEn?: string;
  experienceYears?: number;
  barNumber?: string;
  languages?: string[];
  avatarUrl?: string;
  isFeatured?: boolean;
  workingHours?: WorkingHours;
  createdAt?: string;
  serviceIds?: string[];
  serviceNames?: string[];
  serviceSlugs?: string[];
}

export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
  } | null;
}

export interface LawyerApiResponse {
  id: string;
  slug: string;
  name: string;
  position: string;
  bio: string;
  initials: string;
  avatarColor: string;
  specialties: string[];
  experience: number;
  successfulCases?: number;
  rating?: number;
  reviewCount?: number;
  degree?: string;
  email?: string;
  phone?: string;
  languages: string[];
  isVerified: boolean;
  avatar?: string;
  isFeatured?: boolean;
  workingHours?: WorkingHours;
  serviceIds?: string[];
  serviceNames?: string[];
  serviceSlugs?: string[];
}

function mapLawyerDto(dto: LawyerDTO): LawyerApiResponse {
  const nameParts = dto.nameVi?.split(' ') || dto.nameEn?.split(' ') || [];
  const initials = nameParts.length > 1
    ? nameParts.map(n => n[0]).join('').toUpperCase().slice(-3)
    : (dto.nameVi || dto.nameEn || 'LS').slice(0, 2).toUpperCase();

  return {
    id: dto.id,
    slug: dto.slug || '',
    name: dto.nameVi || dto.nameEn || '',
    position: dto.positionVi || dto.positionEn || 'Luật sư',
    bio: dto.bioVi || dto.bioEn || '',
    initials,
    avatarColor: 'linear-gradient(135deg, #1E3A5F, #C9A84C)',
    specialties: dto.serviceSlugs || [],
    experience: dto.experienceYears || 0,
    languages: dto.languages || ['Tiếng Việt'],
    isVerified: true,
    avatar: dto.avatarUrl,
    isFeatured: dto.isFeatured || false,
    workingHours: dto.workingHours,
    email: dto.userEmail,
    phone: dto.phone,
    serviceIds: dto.serviceIds,
    serviceNames: dto.serviceNames,
    serviceSlugs: dto.serviceSlugs,
  };
}

export async function getLawyers(page = 0, size = 20, serviceSlug?: string): Promise<LawyerApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<{ content: LawyerDTO[] }>>('/public/lawyers', {
      params: { page, size, ...(serviceSlug ? { serviceSlug } : {}) },
    });
    if (data.success && data.data?.content) {
      return data.data.content.map(mapLawyerDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch lawyers:', error);
    return [];
  }
}

export async function getFeaturedLawyers(): Promise<LawyerApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<LawyerDTO[]>>('/public/lawyers/featured');
    if (data.success && data.data) {
      return data.data.map(mapLawyerDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch featured lawyers:', error);
    return [];
  }
}

export async function getLawyerBySlug(slug: string): Promise<LawyerApiResponse | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<LawyerDTO>>(`/public/lawyers/${slug}`);
    if (data.success && data.data) {
      return mapLawyerDto(data.data);
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch lawyer:', error);
    return null;
  }
}

export async function searchLawyers(query: string): Promise<LawyerApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<LawyerDTO[]>>('/public/lawyers/search', {
      params: { query },
    });
    if (data.success && data.data) {
      return data.data.map(mapLawyerDto);
    }
    return [];
  } catch (error) {
    console.error('Failed to search lawyers:', error);
    return [];
  }
}
