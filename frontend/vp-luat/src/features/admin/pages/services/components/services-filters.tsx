'use client';

import { X as XIcon } from 'lucide-react';
import { DateRangePicker } from '@/features/admin/components';
import { SERVICE_CATEGORIES } from '../hooks/use-services';

export interface ServiceFiltersValue {
  category: string;
  status: 'all' | 'active' | 'inactive';
  dateFrom: string;
  dateTo: string;
}

interface ServiceFiltersProps {
  value: ServiceFiltersValue;
  onChange: (next: ServiceFiltersValue) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
] as const;

export function ServiceFilters({ value, onChange }: ServiceFiltersProps) {
  const update = (patch: Partial<ServiceFiltersValue>) => onChange({ ...value, ...patch });
  const hasFilter =
    value.category !== 'all' || value.status !== 'all' || value.dateFrom || value.dateTo;

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
        value={value.category}
        onChange={(e) => update({ category: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc danh mục"
      >
        <option value="all">Tất cả danh mục</option>
        {SERVICE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className="action-btn"
        value={value.status}
        onChange={(e) => update({ status: e.target.value as ServiceFiltersValue['status'] })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc trạng thái"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
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
          onClick={() => update({ category: 'all', status: 'all', dateFrom: '', dateTo: '' })}
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <XIcon size={10} /> Xóa bộ lọc
        </button>
      )}
    </div>
  );
}