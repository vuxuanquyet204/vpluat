import { Headphones } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';

export function ContactHero() {
  return (
    <PageHero
      eyebrow="Liên hệ với chúng tôi"
      eyebrowIcon={<Headphones size={14} aria-hidden />}
      title="Hỗ trợ pháp lý 24/7"
      highlight="24/7"
      subtitle="Đội ngũ luật sư sẵn sàng lắng nghe và hỗ trợ bạn giải quyết mọi vấn đề pháp lý. Buổi tư vấn đầu tiên hoàn toàn miễn phí."
      breadcrumb={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Liên hệ' },
      ]}
      stats={[
        { value: '1900 1234', label: 'Hotline tư vấn' },
        { value: '24/7', label: 'Hỗ trợ liên tục' },
        { value: '3', label: 'Văn phòng toàn quốc' },
        { value: '30 phút', label: 'Phản hồi yêu cầu' },
      ]}
    />
  );
}
