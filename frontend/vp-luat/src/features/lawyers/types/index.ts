export type LawyerSpecialty =
  | 'doanh-nghiep'
  | 'hinh-su'
  | 'dan-su'
  | 'dat-dai'
  | 'fdi'
  | 'lao-dong'
  | 'hon-nhan'
  | 'so-huu-tri-tue'
  | 'thuong-mai';

export type LawyerPosition =
  | 'truong-vp'
  | 'pho-truong-vp'
  | 'cong-su-cao-cap'
  | 'cong-su'
  | 'tu-van-vien';

// Flexible lawyer type that accepts both strict types and API string responses
export interface Lawyer {
  id: string;
  slug: string;
  name: string;
  position: LawyerPosition | string;
  bio: string;
  initials: string;
  avatarColor: string;
  specialties: LawyerSpecialty[] | string[];
  experience: number;
  successfulCases: number;
  rating: number;
  reviewCount: number;
  degree: string;
  email: string;
  phone: string;
  languages: string[];
  isVerified: boolean;
  achievements?: string[];
  education?: string[];
  avatar?: string;
}

export interface LawyerStat {
  value: string;
  label: string;
}

export interface SpecialtyFilter {
  id: 'all' | LawyerSpecialty;
  label: string;
  icon?: string;
  count?: number;
}
