import { Headphones } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { useTranslations } from 'next-intl';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

export function ContactHero() {
  const t = useTranslations('public.contactHero');
  const { data: siteContent } = usePublicSiteContent();
  const contact = siteContent?.contact;
  const offices = siteContent?.offices ?? [];
  return (
    <PageHero
      eyebrow={t('eyebrow')}
      eyebrowIcon={<Headphones size={14} aria-hidden />}
      title={t('title')}
      highlight={t('highlight')}
      subtitle={t('subtitle')}
      breadcrumb={[
        { label: t('home'), href: '/' },
        { label: t('contact') },
      ]}
      stats={[
        { value: contact?.hotline ?? '', label: t('hotline') },
        { value: contact?.workingHours ? '24/7' : '', label: t('support') },
        { value: String(offices.length), label: t('offices') },
        { value: t('responseValue'), label: t('response') },
      ]}
    />
  );
}
