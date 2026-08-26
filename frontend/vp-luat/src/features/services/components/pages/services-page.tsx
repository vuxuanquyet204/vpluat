'use client';

import { useState, useMemo } from 'react';
import { PageHero } from '@/features/services/components/page-hero';
import { ServicesFilterTabs } from '@/features/services/components/services-filter-tabs';
import { ServiceCard } from '@/features/services/components/service-card';
import { ProcessTimeline } from '@/features/services/components/process-timeline';
import { ServicesFaq } from '@/features/services/components/services-faq';
import { ServicesCta } from '@/features/services/components/services-cta';
import { useServices } from '@/features/services/hooks/use-services';
import { useTranslations } from 'next-intl';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

export default function ServicesPage() {
  const t = useTranslations('public.services');
  const filters = useTranslations('public.filters');
  const common = useTranslations('common');
  const [active, setActive] = useState<string>('all');
  const { data: services = [], isLoading } = useServices();
  const { data: siteContent } = usePublicSiteContent();

  const filtered = useMemo(() => {
    if (active === 'all') return services;
    return services.filter((s) => s.category === active);
  }, [active, services]);

  // Calculate stats from API data
  const stats = useMemo(() => ({
    totalServices: services.length,
    totalLawyers: new Set(services.flatMap((service) => service.lawyerIds ?? (service.lawyerId ? [service.lawyerId] : []))).size,
    totalClients: siteContent?.heroStats.clients ?? 0,
    successRate: siteContent?.heroStats.successRate ?? 0,
  }), [services, siteContent]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>{common('loading')}</p>
      </div>
    );
  }

  return (
    <>
      <PageHero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        highlight={t('hero.highlight')}
        breadcrumb={[
          { label: t('breadcrumb.home'), href: '/' },
          { label: t('breadcrumb.current') },
        ]}
        stats={[
          { value: `${stats.totalServices}+`, label: t('stats.services') },
          { value: `${stats.totalLawyers}`, label: t('stats.lawyers') },
          { value: `${stats.totalClients}+`, label: t('stats.clients') },
          { value: `${stats.successRate}%`, label: t('stats.successRate') },
        ]}
      />

      <ServicesFilterTabs active={active} onChange={setActive} />

      <section className="services-section">
        <div className="container">
          <div className="section__header">
            <div className="section__label">{t('catalog.label')}</div>
            <h2 className="section__title">
              {active === 'all'
                ? t('catalog.all')
                : t('catalog.categoryTitle', {
                    category: filters.has(`categories.${active}`) ? filters(`categories.${active}`) : active,
                  })}
            </h2>
            <p className="section__subtitle">
              {t('catalog.count', { visible: filtered.length, total: services.length })}
            </p>
          </div>

          <div className="services-grid">
            {filtered.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="services-empty">
              <p>{t('catalog.empty')}</p>
            </div>
          )}
        </div>
      </section>

      <ProcessTimeline />
      <ServicesFaq />
      <ServicesCta />
    </>
  );
}
