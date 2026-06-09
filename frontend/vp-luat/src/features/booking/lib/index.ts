import type { BookingLawyerOption, BookingServiceOption, BookingConsultationType } from '../types';

export const BOOKING_SERVICES: BookingServiceOption[] = [
  { id: 'service-doanh-nghiep', slug: 'doanh-nghiep', name: 'Luật Doanh nghiệp & M&A', icon: 'building' },
  { id: 'service-hinh-su', slug: 'hinh-su', name: 'Luật Hình sự', icon: 'gavel' },
  { id: 'service-dan-su', slug: 'dan-su', name: 'Luật Dân sự', icon: 'file-text' },
  { id: 'service-dat-dai', slug: 'dat-dai', name: 'Luật Đất đai & BĐS', icon: 'landmark' },
  { id: 'service-lao-dong', slug: 'lao-dong', name: 'Luật Lao động & BHXH', icon: 'users' },
  { id: 'service-fdi', slug: 'fdi', name: 'Đầu tư nước ngoài (FDI)', icon: 'globe' },
  { id: 'service-shtt', slug: 'shtt', name: 'Sở hữu trí tuệ', icon: 'lightbulb' },
  { id: 'service-khac', slug: 'khac', name: 'Tư vấn khác', icon: 'circle-help' },
];

export const BOOKING_LAWYERS: BookingLawyerOption[] = [
  {
    id: 'lawyer-nguyen-van-hung',
    name: 'Ls. Nguyễn Văn Hùng',
    initials: 'NVH',
    specialty: 'Doanh nghiệp & M&A',
    rating: 4.9,
    availabilityLabel: 'Còn lịch hôm nay',
    avatarGradient: 'linear-gradient(135deg, #1E3A5F, #2A4F7A)',
  },
  {
    id: 'lawyer-tran-thi-lan',
    name: 'Ls. Trần Thị Lan',
    initials: 'TTL',
    specialty: 'Hình sự & Dân sự',
    rating: 4.7,
    availabilityLabel: 'Còn lịch hôm nay',
    avatarGradient: 'linear-gradient(135deg, #2A4F7A, #C9A84C)',
  },
  {
    id: 'lawyer-pham-minh-tuan',
    name: 'Ls. Phạm Minh Tuấn',
    initials: 'PMT',
    specialty: 'Đất đai & BĐS',
    rating: 4.8,
    availabilityLabel: 'Còn lịch hôm nay',
    avatarGradient: 'linear-gradient(135deg, #152A45, #1E3A5F)',
  },
];

export const BOOKING_TRUST_ITEMS = [
  'Miễn phí lần đầu tư vấn',
  'Phản hồi trong 15 phút',
  'Bảo mật thông tin 100%',
] as const;

export const BOOKING_CONSULTATION_TYPES: Array<{
  id: BookingConsultationType;
  title: string;
  description: string;
  icon: 'building' | 'video' | 'phone';
}> = [
  {
    id: 'office',
    title: 'Tại văn phòng',
    description: 'Tầng 12, 123 Lê Lợi, Q.1, TP.HCM',
    icon: 'building',
  },
  {
    id: 'video',
    title: 'Online (Video call)',
    description: 'Qua Zoom / Google Meet',
    icon: 'video',
  },
  {
    id: 'phone',
    title: 'Qua điện thoại',
    description: 'Gọi trực tiếp với luật sư',
    icon: 'phone',
  },
];

export const DEMO_BOOKED_TIMES = new Set(['08:00', '09:30', '10:00', '15:00']);

export const BOOKING_TIME_SLOTS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
] as const;
