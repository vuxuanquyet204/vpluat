'use client';

import { useEffect, useId, useRef } from 'react';
import { Star, Mail, Phone, Award, GraduationCap, Languages, X } from 'lucide-react';
import type { LawyerApiResponse } from '../api/lawyers-api';

interface LawyerProfileModalProps {
  lawyer: LawyerApiResponse | null;
  onClose: () => void;
}

function getSpecialtyLabels(lawyer: LawyerApiResponse): string[] {
  if (lawyer.serviceNames && lawyer.serviceNames.length > 0) {
    return lawyer.serviceNames.filter((s): s is string => !!s);
  }
  return lawyer.specialties ?? [];
}

export function LawyerProfileModal({ lawyer, onClose }: LawyerProfileModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!lawyer) return;
    const previousFocus = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Move initial focus into the dialog
    const focusTimeout = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      (focusable ?? dialog).focus();
    }, 30);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.clearTimeout(focusTimeout);
      previousFocus?.focus?.();
    };
  }, [lawyer, onClose]);

  if (!lawyer) return null;

  const titleDomId = `lawyer-modal-title-${titleId}`;

  return (
    <div className="lawyer-modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="lawyer-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleDomId}
        tabIndex={-1}
      >
        <button
          type="button"
          className="lawyer-modal__close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="lawyer-modal__header" style={{ background: lawyer.avatarColor }}>
          <div className="lawyer-modal__avatar" aria-hidden="true">{lawyer.initials}</div>
          <h2 id={titleDomId} className="lawyer-modal__name">{lawyer.name}</h2>
          <p className="lawyer-modal__position">{lawyer.position}</p>
          {/* BE LawyerDTO doesn't currently expose `rating` / `reviewCount`.
              Hide the row when both are missing instead of rendering zeros. */}
          {(lawyer.rating !== undefined || lawyer.reviewCount !== undefined) && (
            <div className="lawyer-modal__rating">
              {lawyer.rating !== undefined && (
                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={16}
                      fill={n <= Math.floor(lawyer.rating ?? 0) ? '#F59E0B' : 'none'}
                      stroke={n <= Math.floor(lawyer.rating ?? 0) ? '#F59E0B' : '#D1D5DB'}
                    />
                  ))}
                </div>
              )}
              <span style={{ marginLeft: '6px' }}>
                {lawyer.rating?.toFixed?.(1) ?? lawyer.rating ?? '—'}
                {lawyer.reviewCount !== undefined && ` · ${lawyer.reviewCount} đánh giá`}
              </span>
            </div>
          )}
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
                <Award size={16} aria-hidden />
                <span><strong>{lawyer.experience}</strong> năm kinh nghiệm</span>
              </li>
              {/* successfulCases / degree are not in the BE LawyerDTO yet.
                  Render only when the BE provides them. */}
              {lawyer.successfulCases !== undefined && lawyer.successfulCases !== null && (
                <li>
                  <Award size={16} aria-hidden />
                  <span><strong>{lawyer.successfulCases}</strong> vụ thành công</span>
                </li>
              )}
              {lawyer.degree && (
                <li>
                  <GraduationCap size={16} aria-hidden />
                  <span>{lawyer.degree}</span>
                </li>
              )}
              <li>
                <Languages size={16} aria-hidden />
                <span>Ngôn ngữ: {lawyer.languages.join(', ')}</span>
              </li>
            </ul>
          </section>

          <section className="lawyer-modal__section">
            <h3>Lĩnh vực chuyên môn</h3>
            <div className="lawyer-modal__tags">
              {getSpecialtyLabels(lawyer).map((sp, i) => (
                <span key={`${sp}-${i}`} className="lawyer-tag">{sp}</span>
              ))}
            </div>
          </section>

          <section className="lawyer-modal__section">
            <h3>Liên hệ</h3>
            <ul className="lawyer-modal__list">
              <li>
                <Phone size={16} aria-hidden />
                <a href={`tel:${lawyer.phone}`}>{lawyer.phone}</a>
              </li>
              <li>
                <Mail size={16} aria-hidden />
                <a href={`mailto:${lawyer.email}`}>{lawyer.email}</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
