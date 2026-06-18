'use client';

import { X as XIcon } from 'lucide-react';
import { DateRangePicker } from '@/features/admin/components';
import type { PostStatus } from '@/features/admin/types';

export interface PostFiltersValue {
  status: PostStatus | 'all';
  category: string;
  author: string;
  tag: string;
  dateFrom: string;
  dateTo: string;
}

interface PostFiltersProps {
  value: PostFiltersValue;
  onChange: (next: PostFiltersValue) => void;
  categories: { id: string; name: string }[];
  authors: string[];
  tags: { id: string; name: string }[];
}

const STATUS_OPTIONS: Array<{ value: PostStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Nháp' },
  { value: 'scheduled', label: 'Lên lịch' },
  { value: 'published', label: 'Đã đăng' },
];

export function PostFilters({ value, onChange, categories, authors, tags }: PostFiltersProps) {
  const update = (patch: Partial<PostFiltersValue>) => onChange({ ...value, ...patch });
  const hasFilter =
    value.status !== 'all' ||
    value.category !== 'all' ||
    value.author !== 'all' ||
    value.tag !== 'all' ||
    value.dateFrom ||
    value.dateTo;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <select
        className="action-btn"
        value={value.status}
        onChange={(e) => update({ status: e.target.value as PostStatus | 'all' })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc trạng thái"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className="action-btn"
        value={value.category}
        onChange={(e) => update({ category: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc danh mục"
      >
        <option value="all">Tất cả danh mục</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className="action-btn"
        value={value.author}
        onChange={(e) => update({ author: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc tác giả"
      >
        <option value="all">Tất cả tác giả</option>
        {authors.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <select
        className="action-btn"
        value={value.tag}
        onChange={(e) => update({ tag: e.target.value })}
        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        aria-label="Lọc tag"
      >
        <option value="all">Tất cả tag</option>
        {tags.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
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
          onClick={() =>
            update({
              status: 'all',
              category: 'all',
              author: 'all',
              tag: 'all',
              dateFrom: '',
              dateTo: '',
            })
          }
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <XIcon size={10} /> Xóa bộ lọc
        </button>
      )}
    </div>
  );
}