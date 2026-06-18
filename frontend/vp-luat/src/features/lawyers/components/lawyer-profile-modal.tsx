'use client';

import { useEffect } from 'react';
import { Star, Mail, Phone, Award, GraduationCap, Languages, X } from 'lucide-react';
import type { Lawyer } from '../types';
import { POSITION_LABELS, SPECIALTY_LABELS } from '../lib/data/lawyers-data';

interface LawyerProfileModalProps {
  lawyer: Lawyer | null;
  onClose: () => void;
}

export function LawyerProfileModal({ lawyer, onClose }: LawyerProfileModalProps) {
  useEffect(() => {
    if (!lawyer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lawyer, onClose]);

  if (!lawyer) return null;

  return (
    <div className="lawyer-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lawyer-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="lawyer-modal__close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="lawyer-modal__header" style={{ background: lawyer.avatarColor }}>
          <div className="lawyer-modal__avatar">{lawyer.initials}</div>
          <h2 className="lawyer-modal__name">{lawyer.name}</h2>
          <p className="lawyer-modal__position">{POSITION_LABELS[lawyer.position]}</p>
          <div className="lawyer-modal__rating">
            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={16}
                  fill={n <= Math.floor(lawyer.rating) ? '#F59E0B' : 'none'}
                  stroke={n <= Math.floor(lawyer.rating) ? '#F59E0B' : '#D1D5DB'}
                />
              ))}
            </div>
            <span style={{ marginLeft: '6px' }}>
              {lawyer.rating} · {lawyer.reviewCount} đánh giá
            </span>
          </div>
        </div>

        <div className="lawyer-modal__body">
          <section className="lawyer-modal__section">
            <h3>Giới thiệu</h3>
            <p>{lawyer.bio}</p>
          </section>

          <section className="lawyer-modal__section">
            <h3>Thông tin chuyên môn</h3>
            <ul className="lawyer-modal__list">
              <li>
                <Award size={16} />
                <span><strong>{lawyer.experience}</strong> năm kinh nghiệm</span>
              </li>
              <li>
                <Award size={16} />
                <span><strong>{lawyer.successfulCases}</strong> vụ thành công</span>
              </li>
              <li>
                <GraduationCap size={16} />
                <span>{lawyer.degree}</span>
              </li>
              <li>
                <Languages size={16} />
                <span>Ngôn ngữ: {lawyer.languages.join(', ')}</span>
              </li>
            </ul>
          </section>

          <section className="lawyer-modal__section">
            <h3>Lĩnh vực chuyên môn</h3>
            <div className="lawyer-modal__tags">
              {lawyer.specialties.map((sp) => (
                <span key={sp} className="lawyer-tag">{SPECIALTY_LABELS[sp]}</span>
              ))}
            </div>
          </section>

          <section className="lawyer-modal__section">
            <h3>Liên hệ</h3>
            <ul className="lawyer-modal__list">
              <li>
                <Phone size={16} />
                <a href={`tel:${lawyer.phone}`}>{lawyer.phone}</a>
              </li>
              <li>
                <Mail size={16} />
                <a href={`mailto:${lawyer.email}`}>{lawyer.email}</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
