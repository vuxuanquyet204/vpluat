'use client';

import { useTranslations } from 'next-intl';
import { Award, Clock, Shield, Heart, Headphones, FileCheck } from 'lucide-react';

const WHY_ITEMS = [
  { icon: Award, key: 'experience' },
  { icon: Shield, key: 'professional' },
  { icon: Clock, key: 'support' },
  { icon: FileCheck, key: 'transparent' },
  { icon: Heart, key: 'dedicated' },
  { icon: Headphones, key: 'multilingual' },
] as const;

export function WhyChooseUsSection() {
  const t = useTranslations('homeSections.whyChooseUs');

  return (
    <section className="section section--dark">
      <div className="container">
        <div className="section__header">
          <span className="section__label" style={{ color: 'var(--accent)', background: 'rgba(201,168,76,0.15)' }}>
            {t('label')}
          </span>
          <h2 className="section__title section__title--white">{t('title')}</h2>
          <p className="section__subtitle section__subtitle--white">{t('subtitle')}</p>
        </div>

        <div className="why__grid">
          {WHY_ITEMS.map((item) => (
            <div key={item.key} className="why-card">
              <div className="why-card__icon"><item.icon size={28} /></div>
              <div className="why-card__content">
                <h3 className="why-card__title">{t(`items.${item.key}.title`)}</h3>
                <p className="why-card__desc">{t(`items.${item.key}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
