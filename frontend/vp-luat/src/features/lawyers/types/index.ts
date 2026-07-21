// BE (brs-backend) trả về `positionVi`/`positionEn` đã là label hiển thị sẵn
// (vd "Trưởng Văn Phòng", "Phó Trưởng Văn Phòng", ...) và `serviceNames` thay vì
// slug thô. FE chỉ cần render string, không map enum cứng nữa.

export type LawyerSpecialty = string;
export type LawyerPosition = string;

export interface Lawyer {
  id: string;
  slug: string;
  name: string;
  position: LawyerPosition;
  bio: string;
  initials: string;
  avatarColor: string;
  /** Slug dịch vụ (vd 'tu-van-phap-ly') - thường lấy từ `serviceSlugs` trong API. */
  specialties: LawyerSpecialty[];
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
  /** Service slug từ backend (also used làm filter id). 'all' = tất cả. */
  id: 'all' | string;
  label: string;
  icon?: string;
  count?: number;
}