import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Lawyer } from '@/features/admin/types';

interface BackendLawyer {
  id: string;
  nameVi: string;
  nameEn: string;
  positionVi: string;
  avatarUrl: string;
  experienceYears?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function mapBackendLawyer(l: BackendLawyer): Lawyer {
  return {
    id: l.id,
    name: l.nameVi || l.nameEn || 'Unknown',
    title: l.positionVi || '',
    bio: '',
    email: '',
    phone: '',
    isActive: true,
    specialties: [],
    experience: l.experienceYears || 0,
    serviceIds: [],
    createdAt: '',
  };
}

async function fetchLawyers(): Promise<Lawyer[]> {
  const res = await apiClient.get<ApiResponse<BackendLawyer[]>>('/admin/lawyers');
  return res.data.data.map(mapBackendLawyer);
}

export function useLawyers() {
  return useQuery({
    queryKey: ['admin', 'lawyers'],
    queryFn: fetchLawyers,
    staleTime: 5 * 60 * 1000,
  });
}
