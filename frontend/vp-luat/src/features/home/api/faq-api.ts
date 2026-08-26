import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
}

export async function getPublicFaqs(locale: string): Promise<PublicFaq[]> {
  const { data } = await apiClient.get<ApiResponse<PublicFaq[]>>('/public/faqs', {
    params: { locale },
  });

  return data.success && data.data ? data.data : [];
}
