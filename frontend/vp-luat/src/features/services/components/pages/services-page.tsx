'use client';

import { useState, useMemo } from 'react';
import { PageHero } from '@/features/services/components/page-hero';
import { ServicesFilterTabs } from '@/features/services/components/services-filter-tabs';
import { ServiceCard } from '@/features/services/components/service-card';
import { ProcessTimeline } from '@/features/services/components/process-timeline';
import { ServicesFaq } from '@/features/services/components/services-faq';
import { ServicesCta } from '@/features/services/components/services-cta';
import { SERVICES, SERVICES_STATS } from '@/features/services/lib/data/services-data';
import type { ServiceCategory } from '@/features/services/types';

export default function ServicesPage() {
  const [active, setActive] = useState<'all' | ServiceCategory>('all');

  const filtered = useMemo(() => {
    if (active === 'all') return SERVICES;
    return SERVICES.filter((s) => s.category === active);
  }, [active]);

  return (
    <>
      <PageHero
        title="Dịch vụ pháp lý toàn diện"
        subtitle="Đồng hành cùng bạn trên mọi lĩnh vực pháp luật — từ tư vấn đơn giản đến tranh tụng phức tạp. Minh bạch, chuyên nghiệp, tận tâm."
        highlight="pháp lý toàn diện"
        breadcrumb={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Dịch vụ' },
        ]}
        stats={[
          { value: `${SERVICES_STATS.totalServices}+`, label: 'Dịch vụ' },
          { value: `${SERVICES_STATS.totalLawyers}`, label: 'Luật sư' },
          { value: `${SERVICES_STATS.totalClients}+`, label: 'Khách hàng' },
          { value: `${SERVICES_STATS.successRate}%`, label: 'Tỷ lệ thành công' },
        ]}
      />

      <ServicesFilterTabs active={active} onChange={setActive} />

      <section className="services-section">
        <div className="container">
          <div className="section__header">
            <div className="section__label">Danh mục dịch vụ</div>
            <h2 className="section__title">
              {active === 'all'
                ? 'Tất cả dịch vụ'
                : 'Dịch vụ ' + active.replace('-', ' & ')}
            </h2>
            <p className="section__subtitle">
              Hiển thị {filtered.length} dịch vụ trong tổng số {SERVICES.length} dịch vụ của chúng tôi.
            </p>
          </div>

          <div className="services-grid">
            {filtered.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="services-empty">
              <p>Chưa có dịch vụ nào trong danh mục này.</p>
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
