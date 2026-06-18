import { LAWYERS_STATS } from '../lib/data/lawyers-data';
import { PageHero } from '@/components/layout/page-hero';

interface LawyersHeroProps {
  totalCount: number;
}

export function LawyersHero({ totalCount }: LawyersHeroProps) {
  return (
    <PageHero
      eyebrow="Đội ngũ luật sư"
      title="Đội ngũ luật sư tận tâm"
      highlight="tận tâm"
      subtitle="Hơn 20 năm kinh nghiệm, đội ngũ luật sư của chúng tôi tự hào đồng hành cùng khách hàng trong mọi tình huống pháp lý phức tạp nhất."
      breadcrumb={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Luật sư' },
      ]}
      stats={LAWYERS_STATS.map((s) => ({
        ...s,
        value: s.value === '6' ? String(totalCount) : s.value,
      }))}
    />
  );
}
