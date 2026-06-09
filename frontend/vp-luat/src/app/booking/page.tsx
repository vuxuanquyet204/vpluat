import type { Metadata } from 'next';
import { BookingPage } from '@/features/booking';

export const metadata: Metadata = {
  title: 'Đặt lịch tư vấn',
  description:
    'Đặt lịch tư vấn pháp lý trực tuyến với đội ngũ luật sư Văn Phòng Luật Hùng & Cộng sự. Nhanh chóng, tiện lợi, miễn phí lần đầu.',
};

export default function BookingRoutePage() {
  return <BookingPage />;
}
