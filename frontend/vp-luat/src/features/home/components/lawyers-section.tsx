'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

// Social icons as inline SVGs
function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const LAWYERS = [
  {
    name: 'Nguyễn Văn Hùng',
    position: 'Luật sư - Giám đốc',
    tags: ['Doanh nghiệp', 'M&A'],
    experience: '18 năm kinh nghiệm',
    image: '/images/lawyers/lawyer-1.jpg',
  },
  {
    name: 'Trần Thị Mai Lan',
    position: 'Luật sư cao cấp',
    tags: ['Đất đai', 'Dân sự'],
    experience: '15 năm kinh nghiệm',
    image: '/images/lawyers/lawyer-2.jpg',
  },
  {
    name: 'Lê Minh Đức',
    position: 'Luật sư',
    tags: ['Hình sự', 'Lao động'],
    experience: '12 năm kinh nghiệm',
    image: '/images/lawyers/lawyer-3.jpg',
  },
  {
    name: 'Phạm Thu Hà',
    position: 'Luật sư',
    tags: ['Hành chính', 'Đất đai'],
    experience: '10 năm kinh nghiệm',
    image: '/images/lawyers/lawyer-4.jpg',
  },
];

export function LawyersSection() {
  return (
    <section className="section section--gray">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Đội ngũ</span>
          <h2 className="section__title">Luật Sư Chuyên Nghiệp</h2>
          <p className="section__subtitle">
            Đội ngũ luật sư giàu kinh nghiệm, tận tâm với khách hàng
          </p>
        </div>

        <div className="team__grid">
          {LAWYERS.map((lawyer) => (
            <div key={lawyer.name} className="lawyer-card">
              <div className="lawyer-card__image">
                <Image
                  src={lawyer.image}
                  alt={lawyer.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
                <div className="lawyer-card__avatar">
                  {lawyer.name.split(' ').slice(-1)[0]}
                </div>
                <div className="lawyer-card__overlay">
                  <div className="lawyer-card__socials">
                    <a href="#" className="lawyer-card__social" aria-label="Facebook">
                      <FacebookIcon size={16} />
                    </a>
                    <a href="#" className="lawyer-card__social" aria-label="LinkedIn">
                      <LinkedinIcon size={16} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="lawyer-card__body">
                <h3 className="lawyer-card__name">{lawyer.name}</h3>
                <p className="lawyer-card__position">{lawyer.position}</p>
                <div className="lawyer-card__tags">
                  {lawyer.tags.map((tag) => (
                    <span key={tag} className="lawyer-card__tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="lawyer-card__experience">
                  <span className="lawyer-card__exp-icon">
                    <Calendar size={14} />
                  </span>
                  <span className="lawyer-card__exp-text">
                    <strong>{lawyer.experience}</strong>
                  </span>
                </div>
                <Link
                  href={`/luat-su/${lawyer.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="lawyer-card__btn"
                >
                  Xem hồ sơ
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
