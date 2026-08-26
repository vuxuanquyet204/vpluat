// lib/api/admin-case-study.ts
// Case Studies API

import { api } from './hooks';

export interface CaseStudy {
  id: string;
  slug: string;
  titleVi?: string;
  titleEn?: string;
  excerptVi?: string;
  excerptEn?: string;
  contentVi?: string;
  contentEn?: string;
  outcome?: string;
  thumbnailUrl?: string;
  ogImageUrl?: string;
  serviceIds?: string[];
  serviceNames?: (string | null)[];
  published: boolean;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CaseStudyRequest {
  slug: string;
  titleVi: string;
  titleEn?: string;
  excerptVi?: string;
  excerptEn?: string;
  contentVi?: string;
  contentEn?: string;
  outcome?: string;
  thumbnailUrl?: string;
  ogImageUrl?: string;
  serviceIds?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export const caseStudyApi = {
  list: (params?: { publishedOnly?: boolean }) =>
    api.get<CaseStudy[]>(`/admin/case-studies`, params),

  publicList: (params?: { serviceId?: string }) =>
    api.get<CaseStudy[]>(`/public/case-studies`, params),

  publicGetBySlug: (slug: string) =>
    api.get<CaseStudy>(`/public/case-studies/${encodeURIComponent(slug)}`),

  get: (id: string) => api.get<CaseStudy>(`/admin/case-studies/${id}`),

  create: (body: CaseStudyRequest) => api.post<CaseStudy>(`/admin/case-studies`, body),

  update: (id: string, body: Partial<CaseStudyRequest>) =>
    api.put<CaseStudy>(`/admin/case-studies/${id}`, body),

  publish: (id: string) => api.patch<CaseStudy>(`/admin/case-studies/${id}/publish`, {}),

  unpublish: (id: string) => api.patch<CaseStudy>(`/admin/case-studies/${id}/unpublish`, {}),

  delete: (id: string) => api.del<void>(`/admin/case-studies/${id}`),
};
