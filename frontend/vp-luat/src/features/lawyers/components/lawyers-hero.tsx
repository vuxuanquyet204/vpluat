import { PageHero } from '@/components/layout/page-hero';
import { useTranslations } from 'next-intl';

interface LawyersHeroProps {
  totalCount: number;
}

export function LawyersHero({ totalCount }: LawyersHeroProps) {
  const t = useTranslations('public.lawyers');
  return (
    <PageHero
      eyebrow={t('hero.eyebrow')}
      title={t('hero.title')}
      highlight={t('hero.highlight')}
      subtitle={t('hero.subtitle')}
      breadcrumb={[
        { label: t('breadcrumb.home'), href: '/' },
        { label: t('breadcrumb.current') },
      ]}
      stats={totalCount > 0 ? [{ value: String(totalCount), label: t('stats.lawyers') }] : undefined}
    />
  );
}
