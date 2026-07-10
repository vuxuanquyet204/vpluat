import type { BookingLawyerOption, BookingServiceOption, BookingConsultationType } from '../types';

export const BOOKING_SERVICES: BookingServiceOption[] = [
  { id: 'service-tu-van-phap-ly', slug: 'tu-van-phap-ly', name: 'Tư vấn pháp lý', icon: 'scale' },
  { id: 'service-dai-dien-phap-ly', slug: 'dai-dien-phap-ly', name: 'Đại diện pháp lý', icon: 'gavel' },
  { id: 'service-to-cao-khieu-nai', slug: 'to-cao-khieu-nai', name: 'Tố cáo & Khiếu nại', icon: 'alert' },
  { id: 'service-thu-tuc-hanh-chinh', slug: 'thu-tuc-hanh-chinh', name: 'Thủ tục hành chính', icon: 'file-text' },
  { id: 'service-lao-dong', slug: 'lao-dong', name: 'Luật Lao động & BHXH', icon: 'users' },
  { id: 'service-doanh-nghiep', slug: 'doanh-nghiep', name: 'Luật Doanh nghiệp', icon: 'briefcase' },
  { id: 'service-nha-dat', slug: 'nha-dat', name: 'Luật Nhà đất & BĐS', icon: 'home' },
  { id: 'service-so-huu-tri-tue', slug: 'so-huu-tri-tue', name: 'Sở hữu trí tuệ', icon: 'lightbulb' },
  { id: 'service-fdi', slug: 'fdi', name: 'FDI — Đầu tư nước ngoài', icon: 'globe' },
  { id: 'service-hinh-su', slug: 'hinh-su', name: 'Luật Hình sự', icon: 'shield' },
  { id: 'service-tu-van-hop-dong', slug: 'tu-van-hop-dong', name: 'Tư vấn hợp đồng', icon: 'file-signature' },
  { id: 'service-ly-hon', slug: 'ly-hon', name: 'Ly hôn & Gia đình', icon: 'heart' },
  { id: 'service-ma', slug: 'ma', name: 'M&A — Mua bán & Sáp nhập', icon: 'handshake' },
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
