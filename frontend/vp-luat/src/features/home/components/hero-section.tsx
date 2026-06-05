'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Briefcase, Users, Phone } from 'lucide-react';

const HERO_STATS = [
  { icon: Calendar, text: '15+ năm kinh nghiệm' },
  { divider: true },
  { icon: Briefcase, text: '2.000+ vụ việc thành công' },
  { divider: true },
  { icon: Users, text: '50+ luật sư chuyên nghiệp' },
];

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__bg">
        <Image
          src="/images/hero-bg.jpg"
          alt="VP Luật Hùng & Cộng sự"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="hero__overlay" />

      <div className="container hero__content">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          15+ năm kinh nghiệm tư vấn pháp lý
        </div>

        <h1 className="hero__title">
          Giải Pháp Pháp Lý <em>Toàn Diện</em>
          <br />
          Cho Doanh Nghiệp & Cá Nhân
        </h1>

        <div className="hero__stats">
          {HERO_STATS.map((stat, i) =>
            'divider' in stat ? (
              <span key={i} className="hero__stat-divider" />
            ) : (
              <div key={i} className="hero__stat">
                <stat.icon className="hero__stat-icon" size={16} />
                <span>{stat.text}</span>
              </div>
            )
          )}
        </div>

        <div className="hero__ctas">
          <Link href="/lien-he" className="btn btn--primary btn--lg">
            Đặt lịch tư vấn ngay
          </Link>
          <Link href="/dich-vu" className="btn btn--outline btn--lg">
            Khám phá dịch vụ
          </Link>
        </div>

        <div className="hero__hotline">
          <div className="hero__hotline-icon">
            <Phone size={20} />
          </div>
          <div className="hero__hotline-info">
            <span className="hero__hotline-label">Tư vấn miễn phí</span>
            <span className="hero__hotline-number">1900 1234</span>
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="container">
          <div className="stats-bar__inner">
            <div className="stats-bar__item">
              <div className="stats-bar__number">
                15<span className="counter-suffix">+</span>
              </div>
              <div className="stats-bar__label">Năm kinh nghiệm</div>
              <div className="stats-bar__sublabel">Hoạt động từ 2009</div>
            </div>
            <div className="stats-bar__item">
              <div className="stats-bar__number">
                2.000<span className="counter-suffix">+</span>
              </div>
              <div className="stats-bar__label">Vụ việc thành công</div>
              <div className="stats-bar__sublabel">Tỷ lệ thắng 95%</div>
            </div>
            <div className="stats-bar__item">
              <div className="stats-bar__number">
                50<span className="counter-suffix">+</span>
              </div>
              <div className="stats-bar__label">Luật sư chuyên nghiệp</div>
              <div className="stats-bar__sublabel">Thạc sĩ, Tiến sĩ luật</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
