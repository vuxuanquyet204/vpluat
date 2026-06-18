'use client';

import { X as XIcon } from 'lucide-react';
import { DateRangePicker } from '@/features/admin/components';

export interface BookingFiltersValue {
  status: string;
  lawyer: string;
  method: string;
  dateFrom: string;
  dateTo: string;
}

interface BookingFiltersProps {
  value: BookingFiltersValue;
  onChange: (next: BookingFiltersValue) => void;
  lawyers: string[];
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const METHOD_OPTIONS = [
  { value: 'all', label: 'Tất cả hình thức' },
  { value: 'office', label: 'Tại VP' },
  { value: 'online', label: 'Online' },
  { value: 'phone', label: 'Phone' },
];

export function BookingFilters({ value, onChange, lawyers }: BookingFiltersProps) {
  const update = (patch: Partial<BookingFiltersValue>) => onChange({ ...value, ...patch });

  const hasFilter =
    value.status !== 'all' || value.lawyer !== 'all' || value.method !== 'all' || value.dateFrom || value.dateTo;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <select
        className="action-btn"
        value={value.status}
        onChange={(e) => update({ status: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className="action-btn"
        value={value.lawyer}
        onChange={(e) => update({ lawyer: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
      >
        <option value="all">Tất cả luật sư</option>
        {lawyers.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select
        className="action-btn"
        value={value.method}
        onChange={(e) => update({ method: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
      >
        {METHOD_OPTIONS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <DateRangePicker
        startDate={value.dateFrom}
        endDate={value.dateTo}
        onChange={(s, e) => update({ dateFrom: s, dateTo: e })}
      />
      {hasFilter && (
        <button
          type="button"
          className="action-btn"
          onClick={() => update({ status: 'all', lawyer: 'all', method: 'all', dateFrom: '', dateTo: '' })}
          style={{ fontSize: '0.75rem' }}
        >
          <XIcon size={10} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }} />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
