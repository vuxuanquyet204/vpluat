'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Award } from 'lucide-react';
import { useLawyerBySlug } from '@/features/lawyers/hooks/use-lawyers';

export default function LawyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: lawyer, isLoading } = useLawyerBySlug(id);

  if (isLoading) {
    return (
      <main className="lawyer-detail">
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <p>Đang tải thông tin luật sư...</p>
        </div>
      </main>
    );
  }

  if (!lawyer) {
    return (
      <main className="lawyer-detail">
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1>Không tìm thấy luật sư</h1>
          <Link href="/lawyers" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <ArrowLeft size={18} /> Quay lại danh sách
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="lawyer-detail">
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__breadcrumbs">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <Link href="/lawyers">Luật sư</Link>
            <span>/</span>
            <span>{lawyer.name}</span>
          </div>
          <h1 className="page-hero__title">{lawyer.name}</h1>
          <p className="page-hero__subtitle">{lawyer.position}</p>
        </div>
      </section>

      <section className="section">
        <div className="container lawyer-detail__layout">
          <div className="lawyer-detail__main">
            <div className="lawyer-detail__header">
              <div className="lawyer-detail__avatar" aria-hidden>
                {lawyer.avatar ? (
                  <img src={lawyer.avatar} alt={lawyer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <i className="fa-solid fa-user-tie" />
                )}
              </div>
              <div>
                <h1 className="lawyer-detail__name">{lawyer.name}</h1>
                <p className="lawyer-detail__position">{lawyer.position}</p>
                <p className="lawyer-detail__specialty">
                  Chuyên môn: {(lawyer.specialties ?? []).join(', ') || '—'}
                </p>
              </div>
            </div>

            <div className="lawyer-detail__bio">
              <h2>Tiểu sử</h2>
              <p>{lawyer.bio || 'Đang cập nhật.'}</p>
            </div>

            {lawyer.experience ? (
              <div className="lawyer-detail__achievements">
                <h2>Thông tin</h2>
                <ul>
                  <li>
                    <Award className="lawyer-detail__check" size={18} aria-hidden /> {lawyer.experience}+ năm kinh nghiệm
                  </li>
                  <li>
                    <Award className="lawyer-detail__check" size={18} aria-hidden /> Ngôn ngữ: {(lawyer.languages ?? []).join(', ')}
                  </li>
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="lawyer-detail__sidebar">
            <div className="lawyer-detail__card">
              <h3>Đặt lịch tư vấn</h3>
              <p>Liên hệ trực tiếp với {lawyer.name} để được tư vấn chuyên sâu.</p>
              <Link href={`/booking?lawyer=${lawyer.id}`} className="btn btn--primary btn--block">
                Đặt lịch ngay
              </Link>
            </div>
            <div className="lawyer-detail__card">
              <h3>Liên hệ</h3>
              <ul>
                <li>
                  <Phone size={16} aria-hidden /> {lawyer.phone ?? lawyer.email ?? '1900 1234'}
                </li>
                {lawyer.email && (
                  <li>
                    <Mail size={16} aria-hidden /> {lawyer.email}
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <div className="container lawyer-detail__back">
        <Link href="/lawyers" className="lawyer-detail__back-link">
          <ArrowLeft size={18} aria-hidden /> Quay lại danh sách luật sư
        </Link>
      </div>
    </main>
  );
}
