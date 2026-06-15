import { ServicesPage } from '@/features/services';
import { SERVICES } from '@/features/services/lib/data/services-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dịch vụ pháp lý',
  description:
    'Tổng hợp các dịch vụ pháp lý chuyên nghiệp của VP Luật Hùng & Cộng sự: thành lập doanh nghiệp, tư vấn hợp đồng, ly hôn, đất đai, sở hữu trí tuệ.',
  alternates: { canonical: '/services' },
};

export default function Page() {
  return <ServicesPage />;
}

export function generateStaticParams() {
  return [];
}
