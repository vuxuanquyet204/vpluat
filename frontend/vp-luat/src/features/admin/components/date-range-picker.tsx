'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  onChange: (start: string, end: string) => void;
  presets?: Array<{ label: string; days: number }>;
}

const DEFAULT_PRESETS = [
  { label: 'Hôm nay', days: 0 },
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: 'Tháng này', days: -1 },
];

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function presetRange(preset: { days: number }): [string, string] {
  const end = new Date();
  if (preset.days === -1) {
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return [toDateStr(start), toDateStr(end)];
  }
  const start = new Date();
  start.setDate(start.getDate() - preset.days);
  return [toDateStr(start), toDateStr(end)];
}

export function DateRangePicker({ startDate, endDate, onChange, presets = DEFAULT_PRESETS }: DateRangePickerProps) {
  const [local, setLocal] = useState({ start: startDate, end: endDate });

  useEffect(() => {
    setLocal({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const handleChange = (key: 'start' | 'end', val: string) => {
    const next = { ...local, [key]: val };
    setLocal(next);
    onChange(next.start, next.end);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        padding: '6px 10px',
        background: 'var(--gray-50)',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md, 8px)',
      }}
    >
      <Calendar size={14} strokeWidth={2} color="var(--gray-500)" aria-hidden="true" />
      <input
        type="date"
        value={local.start}
        onChange={(e) => handleChange('start', e.target.value)}
        aria-label="Từ ngày"
        style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', outline: 'none', color: 'var(--gray-700)' }}
      />
      <span style={{ color: 'var(--gray-400)' }}>→</span>
      <input
        type="date"
        value={local.end}
        onChange={(e) => handleChange('end', e.target.value)}
        aria-label="Đến ngày"
        style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', outline: 'none', color: 'var(--gray-700)' }}
      />
      <span style={{ borderLeft: '1px solid var(--gray-200)', height: 16 }} />
      {presets.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => {
            const [s, e] = presetRange(p);
            setLocal({ start: s, end: e });
            onChange(s, e);
          }}
          className="action-btn"
          style={{ padding: '2px 8px', fontSize: '0.72rem' }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
