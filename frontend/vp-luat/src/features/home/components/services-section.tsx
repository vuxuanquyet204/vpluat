'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Scale,
  Gavel,
  Flag,
  Folder,
  Lightbulb,
  Users,
  Briefcase,
  Home,
  FileSignature,
  Handshake,
  Globe,
  Shield,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useFeaturedServices } from '@/features/services/hooks/use-services';

const ICON_MAP: Record<string, LucideIcon> = {
  scale: Scale,
  gavel: Gavel,
  flag: Flag,
  folder: Folder,
  lightbulb: Lightbulb,
  users: Users,
  briefcase: Briefcase,
  home: Home,
  'file-signature': FileSignature,
  handshake: Handshake,
  globe: Globe,
  shield: Shield,
};

const DEFAULT_DESCRIPTION = 'Tư vấn pháp lý chuyên nghiệp, tận tâm';

function getServiceIcon(iconName?: string): LucideIcon {
  if (!iconName) return Scale;
  return ICON_MAP[iconName] ?? Scale;
}

export function ServicesSection() {
  const { data: services = [], isLoading } = useFeaturedServices();

  const displayServices = useMemo(() => {
    if (services.length === 0) return [];
    return services.slice(0, 8);
  }, [services]);

  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Dịch vụ</span>
          <h2 className="section__title">Giải Pháp Pháp Lý Toàn Diện</h2>
          <p className="section__subtitle">
            Chúng tôi cung cấp đa dạng các dịch vụ pháp lý cho cá nhân và doanh nghiệp
          </p>
        </div>

        <div className="services__grid">
          {isLoading && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
              Đang tải dịch vụ nổi bật...
            </p>
          )}
          {!isLoading && displayServices.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
              Đang cập nhật dịch vụ...
            </p>
          )}
          {displayServices.map((service) => {
            const Icon = getServiceIcon(
              service.icon?.replace('fa-solid fa-', '').replace('fa-', ''),
            );
            return (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="service-card"
              >
                <div className="service-card__icon-wrapper">
                  <Icon size={48} strokeWidth={1.5} />
                </div>
                <h3 className="service-card__name">{service.name}</h3>
                <p className="service-card__desc">
                  {service.shortDescription || DEFAULT_DESCRIPTION}
                </p>
                <span className="service-card__link">
                  Tìm hiểu thêm <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
