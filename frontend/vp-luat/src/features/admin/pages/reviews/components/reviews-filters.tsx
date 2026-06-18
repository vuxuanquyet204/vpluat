'use client';

import { X as XIcon } from 'lucide-react';
import type { Review } from '@/features/admin/types';

export interface ReviewFiltersValue {
  rating: 'all' | '1' | '2' | '3' | '4' | '5';
  hasReply: 'all' | 'yes' | 'no';
  dateFrom: string;
  dateTo: string;
}

interface ReviewFiltersProps {
  value: ReviewFiltersValue;
  onChange: (next: ReviewFiltersValue) => void;
  services: string[];
}

const RATING_OPTIONS: Array<{ value: ReviewFiltersValue['rating']; label: string }> = [
  { value: 'all', label: 'Mọi sao' },
  { value: '5', label: '5 sao' },
  { value: '4', label: '4 sao' },
  { value: '3', label: '3 sao' },
  { value: '2', label: '2 sao' },
  { value: '1', label: '1 sao' },
];

const REPLY_OPTIONS: Array<{ value: ReviewFiltersValue['hasReply']; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'yes', label: 'Đã phản hồi' },
  { value: 'no', label: 'Chưa phản hồi' },
];

export function ReviewFilters({ value, onChange, services }: ReviewFiltersProps) {
  const update = (patch: Partial<ReviewFiltersValue>) => onChange({ ...value, ...patch });
  const hasFilter =
    value.rating !== 'all' || value.hasReply !== 'all' || value.dateFrom || value.dateTo;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <select
        className="action-btn"
        value={value.rating}
        onChange={(e) => update({ rating: e.target.value as ReviewFiltersValue['rating'] })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc rating"
      >
        {RATING_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className="action-btn"
        value={value.hasReply}
        onChange={(e) => update({ hasReply: e.target.value as ReviewFiltersValue['hasReply'] })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc trạng thái phản hồi"
      >
        {REPLY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="action-btn"
        value={value.dateFrom}
        onChange={(e) => update({ dateFrom: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Từ ngày"
      />
      <input
        type="date"
        className="action-btn"
        value={value.dateTo}
        onChange={(e) => update({ dateTo: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Đến ngày"
      />

      {hasFilter && (
        <button
          type="button"
          className="action-btn"
          onClick={() => update({ rating: 'all', hasReply: 'all', dateFrom: '', dateTo: '' })}
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <XIcon size={10} /> Xóa bộ lọc
        </button>
      )}

      {services.length > 0 && (
        <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
          {services.length} dịch vụ
        </span>
      )}
    </div>
  );
}