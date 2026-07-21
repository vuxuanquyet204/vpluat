import type { BookingConsultationType } from '../types';

// BOOKING_SERVICES và BOOKING_LAWYERS trước đây hardcode 13 dịch vụ + 3 luật sư
// đã được thay bằng API:
//   - Dịch vụ: useBookingServices() -> /api/public/services
//   - Luật sư: useLawyersQuery(serviceSlug) -> /api/public/lawyers?serviceSlug=
// File này chỉ giữ các cấu hình tĩnh không phụ thuộc dữ liệu nghiệp vụ.

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