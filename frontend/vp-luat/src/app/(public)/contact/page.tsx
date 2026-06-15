import { ContactPage } from '@/features/contact';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liên hệ tư vấn pháp lý',
  description:
    'Liên hệ VP Luật Hùng & Cộng sự để được tư vấn pháp lý miễn phí. Hotline 1900 1234, hệ thống văn phòng tại Hà Nội, TP HCM, Đà Nẵng.',
  alternates: { canonical: '/contact' },
};

export default function Page() {
  return <ContactPage />;
}
