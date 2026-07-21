'use client';

import { Star } from 'lucide-react';
import type { Lawyer } from '../types';
import type { LawyerApiResponse } from '../api/lawyers-api';

interface LawyerCardProps {
  lawyer: LawyerApiResponse | Lawyer;
  onViewProfile?: (lawyer: LawyerApiResponse) => void;
  onBook?: (lawyer: LawyerApiResponse) => void;
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

function getSpecialtyLabels(lawyer: LawyerApiResponse): string[] {
  // Ưu tiên serviceNames (BE trả về tên đẹp) - nếu thiếu thì dùng serviceSlugs
  if (lawyer.serviceNames && lawyer.serviceNames.length > 0) {
    return lawyer.serviceNames.filter((s): s is string => !!s);
  }
  return lawyer.specialties ?? [];
}

export function LawyerCard({ lawyer, onViewProfile, onBook }: LawyerCardProps) {
  const apiLawyer = lawyer as LawyerApiResponse;
  const specialtyLabels = getSpecialtyLabels(apiLawyer);
  const rating = lawyer.rating ?? 0;
  const reviewCount = lawyer.reviewCount ?? 0;
  const experience = lawyer.experience ?? 0;
  const successfulCases = lawyer.successfulCases ?? 0;

  return (
    <article className="lawyer-card">
      <div className="lawyer-avatar-wrap">
        <div
          className="lawyer-avatar-placeholder"
          style={lawyer.avatar ? undefined : { background: lawyer.avatarColor }}
        >
          {lawyer.avatar ? (
            <img src={lawyer.avatar} alt={lawyer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            lawyer.initials
          )}
        </div>
        <div className="avatar-ring" aria-hidden="true" />
        {lawyer.isVerified && (
          <div className="lawyer-verified" aria-label="Đã xác minh" title="Đã xác minh">
            <i className="fa-solid fa-check" aria-hidden="true" />
          </div>
        )}
      </div>

      <h3 className="lawyer-name">{lawyer.name}</h3>
      <p className="lawyer-position">{lawyer.position}</p>

      <div className="lawyer-stars">
        {renderStars(rating)}
        <span className="lawyer-rating-text">
          ({rating} · {reviewCount} đánh giá)
        </span>
      </div>

      <div className="lawyer-tags">
        {specialtyLabels.map((sp, i) => (
          <span key={`${sp}-${i}`} className="lawyer-tag">{sp}</span>
        ))}
      </div>

      <div className="lawyer-meta">
        <span className="lawyer-meta-item">
          <i className="fa-solid fa-clock" aria-hidden="true" /> <strong>{experience}</strong> năm kinh nghiệm
        </span>
        <span className="lawyer-meta-item">
          <i className="fa-solid fa-trophy" aria-hidden="true" /> <strong>{successfulCases}</strong> vụ thành công
        </span>
      </div>

      <p className="lawyer-degree">
        <i className="fa-solid fa-graduation-cap" aria-hidden="true" /> {lawyer.degree}
      </p>

      <div className="lawyer-card-actions">
        <button
          type="button"
          className="card-btn card-btn-profile"
          onClick={() => onViewProfile?.(apiLawyer)}
        >
          <i className="fa-solid fa-user" aria-hidden="true" /> Xem hồ sơ
        </button>
        <button
          type="button"
          className="card-btn card-btn-book"
          onClick={() => onBook?.(apiLawyer)}
        >
          <i className="fa-solid fa-calendar-plus" aria-hidden="true" /> Đặt lịch
        </button>
      </div>
    </article>
  );
}
