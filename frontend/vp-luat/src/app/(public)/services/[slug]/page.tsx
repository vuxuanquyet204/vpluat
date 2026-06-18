import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react'
import { SERVICES, SERVICES_FAQS, PROCESS_STEPS, SERVICES_STATS } from '@/features/services/lib/data/services-data';
import { LAWYERS_BY_ID } from '@/features/lawyers/lib/data/lawyers-data';
import { LawyersHero } from '@/features/lawyers/components/lawyers-hero';
import { LawyerCard } from '@/features/lawyers/components/lawyer-card';
import { PageHero } from '@/features/services/components/page-hero';
import { ServicesFaq } from '@/features/services/components/services-faq';
import { ServicesCta } from '@/features/services/components/services-cta';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return { title: 'Dịch vụ không tồn tại' };
  return {
    title: service.title,
    description: service.shortDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const related = SERVICES.filter((s) => s.slug !== service.slug && s.category === service.category).slice(0, 3);
  const lawyerIds = (service as { lawyerIds?: string[] }).lawyerIds ?? [];
  const lawyers = lawyerIds.map((id) => LAWYERS_BY_ID[id]).filter(Boolean);

  return (
    <main className="service-detail">
      <PageHero
        breadcrumb={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Dịch vụ', href: '/services' },
          { label: service.title ?? service.name },
        ]}
        title={service.title ?? service.name}
        subtitle={service.shortDescription}
        stats={[
          { value: String(SERVICES_STATS.totalServices), label: 'Dịch vụ' },
          { value: String(SERVICES_STATS.totalLawyers), label: 'Luật sư' },
          { value: String(SERVICES_STATS.successRate) + '%', label: 'Tỷ lệ thành công' },
        ]}
      />

      <section className="section">
        <div className="container service-detail__body">
          <div className="service-detail__content">
            <div className="service-detail__description">
              <h2>Tổng quan dịch vụ</h2>
              <p>{service.description}</p>
            </div>

            {service.benefits && service.benefits.length > 0 && (
              <div className="service-detail__benefits">
                <h2>Lợi ích khi sử dụng dịch vụ</h2>
                <ul className="service-detail__benefits-list">
                  {service.benefits.map((b) => (
                    <li key={b}>
                      <CheckCircle2 className="service-detail__check" size={20} aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="service-detail__process">
              <h2>Quy trình thực hiện</h2>
              <ol className="service-detail__process-list">
                {PROCESS_STEPS.map((s) => (
                  <li key={s.step}>
                    <strong>Bước {s.step}:</strong> {s.title} — {s.description}
                  </li>
                ))}
              </ol>
            </div>

            <div className="service-detail__faq">
              <h2>Câu hỏi thường gặp</h2>
              {SERVICES_FAQS.map((f) => (
                <details key={f.id} className="service-detail__faq-item">
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="service-detail__sidebar">
            <div className="service-detail__info-card">
              <h3>Thông tin dịch vụ</h3>
              <ul className="service-detail__info-list">
                <li>
                  <strong>Danh mục:</strong> {service.category}
                </li>
                <li>
                  <strong>Thời gian xử lý:</strong> {service.duration}
                </li>
                <li>
                  <strong>Phí tư vấn ban đầu:</strong> {service.fee}
                </li>
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
              {lawyers.map((l) => (
                <LawyerCard key={l.id} lawyer={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">Dịch vụ liên quan</h2>
              <p className="section__subtitle">Các dịch vụ pháp lý khác có thể bạn quan tâm</p>
            </div>
            <div className="services-grid">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/services/${rel.slug}`}
                  className={`service-card service-card--${rel.color}`}
                >
                  <div className="service-card__icon">
                    <i className={rel.icon} aria-hidden />
                  </div>
                  <h3 className="service-card__title">{rel.title}</h3>
                  <p className="service-card__desc">{rel.shortDescription}</p>
                </Link>
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
