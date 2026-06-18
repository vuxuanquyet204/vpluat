import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Award } from 'lucide-react';
import { LAWYERS } from '@/features/lawyers/lib/data/lawyers-data';
import { PageHero } from '@/components/layout/page-hero';

export function generateStaticParams() {
  return LAWYERS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const lawyer = LAWYERS.find((l) => l.id === id);
  if (!lawyer) return { title: 'Luật sư không tồn tại' };
  return {
    title: `${lawyer.name} — ${lawyer.position}`,
    description: lawyer.bio,
    alternates: { canonical: `/lawyers/${lawyer.id}` },
  };
}

export default async function LawyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lawyer = LAWYERS.find((l) => l.id === id);
  if (!lawyer) notFound();

  return (
    <main className="lawyer-detail">
      <PageHero
        title={lawyer.name}
        subtitle={`${lawyer.position} · ${lawyer.specialties.join(', ')}`}
        breadcrumb={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Luật sư', href: '/lawyers' },
          { label: lawyer.name },
        ]}
        stats={[
          { value: String(lawyer.experience ?? 0) + '+', label: 'Năm kinh nghiệm' },
          { value: String(lawyer.successfulCases ?? 0) + '+', label: 'Vụ thắng' },
          { value: String(lawyer.rating ?? 0) + '/5', label: 'Đánh giá' },
          { value: String(lawyer.reviewCount ?? 0), label: 'Lượt review' },
        ]}
      />

      <section className="section">
        <div className="container lawyer-detail__layout">
          <div className="lawyer-detail__main">
            <div className="lawyer-detail__header">
              <div className="lawyer-detail__avatar" aria-hidden>
                <i className="fa-solid fa-user-tie" />
              </div>
              <div>
                <h1 className="lawyer-detail__name">{lawyer.name}</h1>
                <p className="lawyer-detail__position">{lawyer.position}</p>
                <p className="lawyer-detail__specialty">
                  Chuyên môn: {lawyer.specialties.join(', ')}
                </p>
              </div>
            </div>

            <div className="lawyer-detail__bio">
              <h2>Tiểu sử</h2>
              <p>{lawyer.bio}</p>
            </div>

            {lawyer.achievements && lawyer.achievements.length > 0 && (
              <div className="lawyer-detail__achievements">
                <h2>Thành tích nổi bật</h2>
                <ul>
                  {lawyer.achievements.map((a) => (
                    <li key={a}>
                      <Award className="lawyer-detail__check" size={18} aria-hidden /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lawyer.education && lawyer.education.length > 0 && (
              <div className="lawyer-detail__education">
                <h2>Học vấn</h2>
                <ul>
                  {lawyer.education.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
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
                  <Phone size={16} aria-hidden /> {lawyer.phone ?? '1900 1234'}
                </li>
                <li>
                  <Mail size={16} aria-hidden /> {lawyer.email ?? 'contact@vuplat.vn'}
                </li>
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
