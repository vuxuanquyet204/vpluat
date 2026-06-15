import { LAWYERS_STATS } from '../lib/data/lawyers-data';
import { PageHero } from '@/features/services/components/page-hero';

interface LawyersHeroProps {
  totalCount: number;
}

export function LawyersHero({ totalCount }: LawyersHeroProps) {
  return (
    <PageHero
      title="Đội ngũ luật sư tận tâm"
      subtitle="Hơn 20 năm kinh nghiệm, đội ngũ luật sư của chúng tôi tự hào đồng hành cùng khách hàng trong mọi tình huống pháp lý phức tạp nhất."
      highlight="tận tâm"
      breadcrumb={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Luật sư' },
      ]}
      stats={LAWYERS_STATS.map((s) => ({ ...s, value: s.value === '6' ? String(totalCount) : s.value }))}
    />
  );
}
