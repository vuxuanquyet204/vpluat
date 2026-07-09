import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import type { Service } from '../types';

interface ServiceCardProps {
  service: Service;
}

const COLOR_CLASS: Record<string, string> = {
  primary: 'service-card__icon--primary',
  accent: 'service-card__icon--accent',
  green: 'service-card__icon--green',
  red: 'service-card__icon--red',
  blue: 'service-card__icon--blue',
  purple: 'service-card__icon--purple',
};

function formatPrice(v?: number) {
  if (!v) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export function ServiceCard({ service }: ServiceCardProps) {
  const colorClass = COLOR_CLASS[service.color || 'primary'] || COLOR_CLASS.primary;
  const categoryLabel = service.category?.replace('-', ' ') || 'Dịch vụ';
  const features = service.features || [];
  const hasLawyer = !!service.lawyerId;
  const icon = service.icon || 'fa-solid fa-gavel';

  return (
    <article className="service-card fade-in">
      <div className="service-card__top">
        <i className={`service-card__icon ${colorClass} ${icon}`} aria-hidden="true" />
        {service.popular && (
          <span className="service-card__category">Phổ biến</span>
        )}
        {!service.popular && (
          <span className="service-card__category">
            {categoryLabel}
          </span>
        )}
      </div>

      <h3 className="service-card__name">{service.name}</h3>
      <p className="service-card__desc">{service.shortDescription}</p>

      {features.length > 0 && (
        <ul className="service-card__list">
          {features.slice(0, 4).map((f, i) => (
            <li key={`${f}-${i}`} className="service-card__list-item">
              <Check size={12} strokeWidth={3} className="service-card__list-icon" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {hasLawyer && (
        <div className="service-card__lawyer">
          <div className="service-card__lawyer-avatar" aria-hidden="true">
            <i className="fa-solid fa-user" />
          </div>
          <div className="service-card__lawyer-info">
            <div className="service-card__lawyer-name">Tư vấn viên</div>
            <div className="service-card__lawyer-exp">
              Chuyên gia pháp lý
            </div>
          </div>
        </div>
      )}

      <div className="service-card__footer">
        <div className="service-card__price">
          <span className="service-card__price-label">Từ</span>
          <span className="service-card__price-value">{formatPrice(service.price)}</span>
        </div>
        <Link
          href={`/services/${service.slug}`}
          className="service-card__cta"
          aria-label={`Tìm hiểu thêm về ${service.name}`}
        >
          Tìm hiểu
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
