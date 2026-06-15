import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Service } from '../types';
import { LAWYERS_BY_ID } from '../../lawers/lib/data/lawyers-data';

interface ServiceCardProps {
  service: Service;
}

const COLOR_CLASS: Record<Service['color'], string> = {
  primary: 'service-card__icon--primary',
  accent: 'service-card__icon--accent',
  green: 'service-card__icon--green',
  red: 'service-card__icon--red',
  blue: 'service-card__icon--blue',
  purple: 'service-card__icon--purple',
};

function formatPrice(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export function ServiceCard({ service }: ServiceCardProps) {
  const lawyer = LAWYERS_BY_ID[service.lawyerId];

  return (
    <article className="service-card fade-in">
      <div className="service-card__top">
        <i className={`service-card__icon ${COLOR_CLASS[service.color]} ${service.icon}`} aria-hidden="true" />
        {service.popular && (
          <span className="service-card__category">Phổ biến</span>
        )}
        {!service.popular && (
          <span className="service-card__category">
            {service.category.replace('-', ' ')}
          </span>
        )}
      </div>

      <h3 className="service-card__name">{service.name}</h3>
      <p className="service-card__desc">{service.shortDescription}</p>

      <ul className="service-card__list">
        {service.features.slice(0, 4).map((f) => (
          <li key={f} className="service-card__list-item">{f}</li>
        ))}
      </ul>

      {lawyer && (
        <div className="service-card__lawyer">
          <div className="service-card__lawyer-avatar" aria-hidden="true">
            {lawyer.initials}
          </div>
          <div className="service-card__lawyer-info">
            <div className="service-card__lawyer-name">{lawyer.name}</div>
            <div className="service-card__lawyer-exp">
              {lawyer.experience} năm kinh nghiệm
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
