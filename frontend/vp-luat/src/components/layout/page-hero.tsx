import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeroStat {
  value: string;
  label: string;
}

export interface PageHeroProps {
  /** Eyebrow label xuất hiện phía trên title (chip nhỏ có icon) */
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  /** Title chính. Nếu có `highlight` thì đoạn khớp sẽ được in nghiêng */
  title: string;
  highlight?: string;
  /** Subtitle/description phía dưới title */
  subtitle?: string;
  /** Danh sách breadcrumb. Item đầu tiên được coi là Home */
  breadcrumb?: BreadcrumbItem[];
  /** Stats dạng số + label (render như chip ngang) */
  stats?: PageHeroStat[];
  /** Slot tuỳ chỉnh dưới subtitle (search box, CTA buttons, ...) */
  children?: ReactNode;
}

export function PageHero({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  subtitle,
  breadcrumb,
  stats,
  children,
}: PageHeroProps) {
  const renderTitle = () => {
    if (!highlight) return title;
    const parts = title.split(highlight);
    if (parts.length === 1) return title;
    return (
      <>
        {parts[0]}
        <em>{highlight}</em>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero__inner">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="page-hero__breadcrumb" aria-label="Breadcrumb">
              {breadcrumb.map((item, i) => (
                <span key={i} className="page-hero__breadcrumb-segment">
                  {i === 0 ? (
                    <Link
                      href={item.href ?? '/'}
                      className="page-hero__breadcrumb-item page-hero__breadcrumb-home"
                    >
                      <Home size={12} aria-hidden />
                      {item.label}
                    </Link>
                  ) : item.href ? (
                    <Link href={item.href} className="page-hero__breadcrumb-item">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="page-hero__breadcrumb-item page-hero__breadcrumb-current" aria-current="page">
                      {item.label}
                    </span>
                  )}
                  {i < breadcrumb.length - 1 && (
                    <span className="page-hero__breadcrumb-sep" aria-hidden>
                      <ChevronRight size={12} />
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {eyebrow && (
            <div className="page-hero__eyebrow">
              {eyebrowIcon}
              {eyebrow}
            </div>
          )}

          <h1 className="page-hero__title">{renderTitle()}</h1>

          {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}

          {children && <div className="page-hero__extra">{children}</div>}

          {stats && stats.length > 0 && (
            <div className="page-hero__stats">
              {stats.map((s, i) => (
                <div key={i} className="page-hero__stat">
                  <span className="page-hero__stat-value">{s.value}</span>
                  <span className="page-hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
