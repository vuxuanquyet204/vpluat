'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Lawyer } from '../types';
import type { LawyerApiResponse } from '../api/lawyers-api';
import { getDisplayLabel } from '@/lib/display-labels';
import { useTranslations } from 'next-intl';

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
    return lawyer.serviceNames
      .filter((s): s is string => !!s)
      .map((serviceName) => getDisplayLabel(serviceName, 'Chuyên môn'));
  }
  return (lawyer.specialties ?? []).map((specialty) => getDisplayLabel(specialty, 'Chuyên môn'));
}

export function LawyerCard({ lawyer, onViewProfile, onBook }: LawyerCardProps) {
  const t = useTranslations('public.lawyerCard');
  const apiLawyer = lawyer as LawyerApiResponse;
  const specialtyLabels = getSpecialtyLabels(apiLawyer);
  const rating = lawyer.rating ?? 0;
  const reviewCount = lawyer.reviewCount ?? 0;
  const experience = lawyer.experience ?? 0;
  const successfulCases = lawyer.successfulCases ?? 0;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(lawyer.avatar) && !imageFailed;

  return (
    <article className="lawyer-card">
      <div className="lawyer-avatar-wrap">
        <div
          className="lawyer-avatar-placeholder"
          style={showImage ? undefined : { background: lawyer.avatarColor }}
        >
          {showImage ? (
            <img
              src={lawyer.avatar}
              alt={lawyer.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            lawyer.initials
          )}
        </div>
        <div className="avatar-ring" aria-hidden="true" />
        {lawyer.isVerified && (
          <div className="lawyer-verified" aria-label={t('verified')} title={t('verified')}>
            <i className="fa-solid fa-check" aria-hidden="true" />
          </div>
        )}
      </div>

      <h3 className="lawyer-name">{lawyer.name}</h3>
      <p className="lawyer-position">{lawyer.position}</p>

      <div className="lawyer-stars">
        {renderStars(rating)}
        <span className="lawyer-rating-text">
          ({rating} · {reviewCount} {t('reviews')})
        </span>
      </div>

      <div className="lawyer-tags">
        {specialtyLabels.map((sp, i) => (
          <span key={`${sp}-${i}`} className="lawyer-tag">{sp}</span>
        ))}
      </div>

      <div className="lawyer-meta">
        <span className="lawyer-meta-item">
          <i className="fa-solid fa-clock" aria-hidden="true" /> <strong>{experience}</strong> {t('yearsExperience')}
        </span>
        <span className="lawyer-meta-item">
          <i className="fa-solid fa-trophy" aria-hidden="true" /> <strong>{successfulCases}</strong> {t('successfulCases')}
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
          <i className="fa-solid fa-user" aria-hidden="true" /> {t('viewProfile')}
        </button>
        <button
          type="button"
          className="card-btn card-btn-book"
          onClick={() => onBook?.(apiLawyer)}
        >
          <i className="fa-solid fa-calendar-plus" aria-hidden="true" /> {t('book')}
        </button>
      </div>
    </article>
  );
}
