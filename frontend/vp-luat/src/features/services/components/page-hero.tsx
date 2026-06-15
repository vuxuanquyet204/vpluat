'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  highlight?: string;
  icon?: string;
  breadcrumb?: BreadcrumbItem[];
  stats?: Array<{ value: string; label: string }>;
}

export function PageHero({
  title,
  subtitle,
  description,
  highlight,
  icon,
  breadcrumb,
  stats,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero__inner">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="page-hero__breadcrumb">
              {breadcrumb.map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {i === 0 ? (
                    <Link
                      href={item.href ?? '/'}
                      className="page-hero__breadcrumb-item"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Home size={12} />
                      {item.label}
                    </Link>
                  ) : item.href ? (
                    <Link href={item.href} className="page-hero__breadcrumb-item">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="page-hero__breadcrumb-item">{item.label}</span>
                  )}
                  {i < breadcrumb.length - 1 && (
                    <span className="page-hero__breadcrumb-sep">
                      <ChevronRight size={12} />
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {icon && (
            <div className="page-hero__icon" aria-hidden>
              <i className={icon} />
            </div>
          )}

          <h1 className="page-hero__title">
            {highlight ? (
              <>
                {title.split(highlight)[0]}
                <em>{highlight}</em>
                {title.split(highlight)[1]}
              </>
            ) : (
              title
            )}
          </h1>

          {(subtitle ?? description) && (
            <p className="page-hero__subtitle">{subtitle ?? description}</p>
          )}

          {stats && stats.length > 0 && (
            <div className="header-stats">
              {stats.map((s, i) => (
                <div key={i} className="header-stat">
                  <span className="header-stat-num">{s.value}</span>
                  <span className="header-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
