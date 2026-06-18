'use client';

import { useState } from 'react';
import { X as XIcon } from 'lucide-react';
import { DateRangePicker } from '@/features/admin/components';
import type { LeadSource } from '@/features/admin/types';

export interface LeadFiltersValue {
  status: string;
  source: string;
  assignedTo: string;
  dateFrom: string;
  dateTo: string;
}

interface LeadFiltersProps {
  value: LeadFiltersValue;
  onChange: (next: LeadFiltersValue) => void;
  assignees: string[];
}

const SOURCES: Array<{ value: LeadSource | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả nguồn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'organic', label: 'Tự nhiên' },
  { value: 'chatbot', label: 'Chatbot' },
  { value: 'referral', label: 'Giới thiệu' },
  { value: 'other', label: 'Khác' },
];

export function LeadFilters({ value, onChange, assignees }: LeadFiltersProps) {
  const [local, setLocal] = useState(value);

  const update = (patch: Partial<LeadFiltersValue>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <select
        className="action-btn"
        value={local.source}
        onChange={(e) => update({ source: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
      >
        {SOURCES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className="action-btn"
        value={local.assignedTo}
        onChange={(e) => update({ assignedTo: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
      >
        <option value="all">Tất cả CSKH</option>
        {assignees.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <DateRangePicker
        startDate={local.dateFrom}
        endDate={local.dateTo}
        onChange={(s, e) => update({ dateFrom: s, dateTo: e })}
      />
      {(local.source !== 'all' || local.assignedTo !== 'all' || local.dateFrom || local.dateTo) && (
        <button
          type="button"
          className="action-btn"
          onClick={() => update({ source: 'all', assignedTo: 'all', dateFrom: '', dateTo: '' })}
          style={{ fontSize: '0.75rem' }}
        >
          <XIcon size={10} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }} />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
