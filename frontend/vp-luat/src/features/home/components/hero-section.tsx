'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';
import { Calendar, Briefcase, Users, Phone } from 'lucide-react';

const HERO_STATS = [
  { icon: Calendar, key: 'experience' },
  { divider: true },
  { icon: Briefcase, key: 'cases' },
  { divider: true },
  { icon: Users, key: 'lawyers' },
] as const;

export function HeroSection() {
  const t = useTranslations('home');
  const { data: siteContent } = usePublicSiteContent();
  const stats = siteContent?.heroStats;
  const hotline = siteContent?.contact.hotline ?? '';

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80&auto=format&fit=crop"
          alt=""
          loading="eager"
        />
      </div>
      <div className="hero__overlay" />

      <div className="container hero__content">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          {t('badge')}
        </div>

        <h1 className="hero__title">
          {t('title')}
        </h1>

        <div className="hero__stats">
          {HERO_STATS.map((stat, i) =>
            'divider' in stat ? (
              <span key={i} className="hero__stat-divider" />
            ) : (
              <div key={i} className="hero__stat">
                <stat.icon className="hero__stat-icon" size={16} />
                <span>{t(`stats.${stat.key}`)}</span>
              </div>
            )
          )}
        </div>

        <div className="hero__ctas">
          <Link href="/booking" className="btn btn--primary btn--lg">
            {t('bookNow')}
          </Link>
          <Link href="/services" className="btn btn--outline btn--lg">
            {t('exploreServices')}
          </Link>
        </div>

        <div className="hero__hotline">
          <div className="hero__hotline-icon">
            <Phone size={20} />
          </div>
          <div className="hero__hotline-info">
            <span className="hero__hotline-label">{t('freeConsultation')}</span>
            <span className="hero__hotline-number">{hotline}</span>
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="container">
          <div className="stats-bar__inner">
            <div className="stats-bar__item">
              <div className="stats-bar__number">
                {stats?.successfulCases ?? 0}<span className="counter-suffix">+</span>
              </div>
              <div className="stats-bar__label">{t('summary.successfulCases')}</div>
              <div className="stats-bar__sublabel">{t('summary.since')}</div>
            </div>
            <div className="stats-bar__item">
              <div className="stats-bar__number">
                {stats?.successRate ?? 0}<span className="counter-suffix">%</span>
              </div>
              <div className="stats-bar__label">{t('summary.successRate')}</div>
              <div className="stats-bar__sublabel">{t('summary.satisfiedClients')}</div>
            </div>
            <div className="stats-bar__item">
              <div className="stats-bar__number">
                {stats?.yearsExperience ?? 0}<span className="counter-suffix">+</span>
              </div>
              <div className="stats-bar__label">{t('summary.years')}</div>
              <div className="stats-bar__sublabel">{t('summary.legalMarket')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
