'use client';

import { Star } from 'lucide-react';
import { POSITION_LABELS, SPECIALTY_LABELS } from '../lib/data/lawyers-data';
import type { Lawyer } from '../types';

interface LawyerCardProps {
  lawyer: Lawyer;
  onViewProfile?: (lawyer: Lawyer) => void;
  onBook?: (lawyer: Lawyer) => void;
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    const half = !filled && i - 0.5 <= rating;
    stars.push(
      <Star
        key={i}
        size={14}
        fill={filled || half ? '#F59E0B' : 'none'}
        stroke={filled || half ? '#F59E0B' : '#D1D5DB'}
      />,
    );
  }
  return stars;
}

export function LawyerCard({ lawyer, onViewProfile, onBook }: LawyerCardProps) {
  return (
    <article className="lawyer-card">
      <div className="lawyer-avatar-wrap">
        <div
          className="lawyer-avatar-placeholder"
          style={{ background: lawyer.avatarColor }}
        >
          {lawyer.initials}
        </div>
        <div className="avatar-ring" aria-hidden="true" />
        {lawyer.isVerified && (
          <div className="lawyer-verified" aria-label="Đã xác minh" title="Đã xác minh">
            <i className="fa-solid fa-check" aria-hidden="true" />
          </div>
        )}
      </div>

      <h3 className="lawyer-name">{lawyer.name}</h3>
      <p className="lawyer-position">{POSITION_LABELS[lawyer.position]}</p>

      <div className="lawyer-stars">
        {renderStars(lawyer.rating)}
        <span className="lawyer-rating-text">
          ({lawyer.rating} · {lawyer.reviewCount} đánh giá)
        </span>
      </div>

      <div className="lawyer-tags">
        {lawyer.specialties.map((sp) => (
          <span key={sp} className="lawyer-tag">{SPECIALTY_LABELS[sp]}</span>
        ))}
      </div>

      <div className="lawyer-meta">
        <span className="lawyer-meta-item">
          <i className="fa-solid fa-clock" aria-hidden="true" /> <strong>{lawyer.experience}</strong> năm kinh nghiệm
        </span>
        <span className="lawyer-meta-item">
          <i className="fa-solid fa-trophy" aria-hidden="true" /> <strong>{lawyer.successfulCases}</strong> vụ thành công
        </span>
      </div>

      <p className="lawyer-degree">
        <i className="fa-solid fa-graduation-cap" aria-hidden="true" /> {lawyer.degree}
      </p>

      <div className="lawyer-card-actions">
        <button
          type="button"
          className="card-btn card-btn-profile"
          onClick={() => onViewProfile?.(lawyer)}
        >
          <i className="fa-solid fa-user" aria-hidden="true" /> Xem hồ sơ
        </button>
        <button
          type="button"
          className="card-btn card-btn-book"
          onClick={() => onBook?.(lawyer)}
        >
          <i className="fa-solid fa-calendar-plus" aria-hidden="true" /> Đặt lịch
        </button>
      </div>
    </article>
  );
}
