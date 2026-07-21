'use client';

import { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import { useServiceBySlug } from '@/features/services/hooks/use-services';
import { useLawyers } from '@/features/lawyers/hooks/use-lawyers';
import { LawyerCard } from '@/features/lawyers/components/lawyer-card';
import { ServicesCta } from '@/features/services/components/services-cta';
import type { LawyerApiResponse } from '@/features/lawyers/api/lawyers-api';

function toLawyerForCard(lawyer: LawyerApiResponse): LawyerApiResponse {
  // LawyerCard đã nhận LawyerApiResponse - chỉ cần đảm bảo các field optional có default.
  return lawyer;
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: service, isLoading } = useServiceBySlug(slug);
  const { data: lawyers = [] } = useLawyers(0, 3, slug);

  if (isLoading) {
    return (
      <main className="service-detail">
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <p>Đang tải dịch vụ...</p>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="service-detail">
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1>Dịch vụ không tồn tại</h1>
          <Link href="/services" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <ArrowLeft size={18} /> Quay lại
          </Link>
        </div>
      </main>
    );
  }

  const benefits = (service as { benefits?: string[] }).benefits ?? [];
  const description = service.description || service.shortDescription || 'Đang cập nhật.';

  return (
    <main className="service-detail">
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__breadcrumbs">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <Link href="/services">Dịch vụ</Link>
            <span>/</span>
            <span>{service.name}</span>
          </div>
          <h1 className="page-hero__title">{service.name}</h1>
          <p className="page-hero__subtitle">{service.shortDescription}</p>
        </div>
      </section>

      <section className="section">
        <div className="container service-detail__body">
          <div className="service-detail__content">
            <div className="service-detail__description">
              <h2>Tổng quan dịch vụ</h2>
              <p>{description}</p>
            </div>

            {benefits.length > 0 && (
              <div className="service-detail__benefits">
                <h2>Lợi ích khi sử dụng dịch vụ</h2>
                <ul className="service-detail__benefits-list">
                  {benefits.map((b) => (
                    <li key={b}>
                      <CheckCircle2 className="service-detail__check" size={20} aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.features && service.features.length > 0 && (
              <div className="service-detail__benefits">
                <h2>Chi tiết</h2>
                <ul className="service-detail__benefits-list">
                  {service.features.map((f) => (
                    <li key={f}>
                      <CheckCircle2 className="service-detail__check" size={20} aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="service-detail__sidebar">
            <div className="service-detail__info-card">
              <h3>Thông tin dịch vụ</h3>
              <ul className="service-detail__info-list">
                <li>
                  <strong>Danh mục:</strong> {service.parentName || service.category}
                </li>
                {service.duration && (
                  <li>
                    <strong>Thời gian xử lý:</strong> {service.duration}
                  </li>
                )}
                {service.price != null && (
                  <li>
                    <strong>Phí tư vấn ban đầu:</strong>{' '}
                    {new Intl.NumberFormat('vi-VN').format(service.price)}đ
                  </li>
                )}
              </ul>
              <Link href="/contact" className="btn btn--primary btn--block">
                Đăng ký tư vấn
              </Link>
            </div>

            <div className="service-detail__contact-card">
              <h3>Liên hệ tư vấn</h3>
              <ul className="service-detail__contact-list">
                <li>
                  <Phone size={16} aria-hidden /> <span>Hotline: 1900 1234</span>
                </li>
                <li>
                  <Mail size={16} aria-hidden /> <span>tuvan@vuplat.vn</span>
                </li>
                <li>
                  <MapPin size={16} aria-hidden /> <span>Hà Nội, TP.HCM, Đà Nẵng</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {lawyers.length > 0 && (
        <section className="section section--gray">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">Luật sư phụ trách</h2>
            </div>
            <div className="lawyers-grid">
              {lawyers.slice(0, 3).map((l) => (
                <LawyerCard
                  key={l.id}
                  lawyer={toLawyerForCard(l)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <ServicesCta />

      <div className="container service-detail__back">
        <Link href="/services" className="service-detail__back-link">
          <ArrowLeft size={18} aria-hidden /> Quay lại danh sách dịch vụ
        </Link>
      </div>
    </main>
  );
}