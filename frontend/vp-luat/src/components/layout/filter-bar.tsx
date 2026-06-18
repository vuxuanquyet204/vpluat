'use client';

import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';

export interface FilterOption<T extends string> {
  id: T;
  label: string;
  /** FontAwesome class cho icon (vd: `fa-solid fa-briefcase`) */
  icon?: string;
  /** Số lượng item trong option này (hiển thị badge) */
  count?: number;
}

interface FilterBarProps<T extends string> {
  /** Label phía trái (vd: "Lọc theo chuyên môn") */
  label?: string;
  /** Icon override cho label (mặc định: Filter icon) */
  labelIcon?: ReactNode;
  /** Danh sách options. Luôn có 'all' làm option đầu tiên nếu cần */
  options: FilterOption<T>[];
  active: T;
  onChange: (value: T) => void;
  /** Số kết quả hiện tại (hiển thị bên phải) */
  resultCount?: number;
  /** Label cho resultCount (vd: "dịch vụ", "luật sư") */
  resultLabel?: string;
}

export function FilterBar<T extends string>({
  label,
  labelIcon,
  options,
  active,
  onChange,
  resultCount,
  resultLabel,
}: FilterBarProps<T>) {
  return (
    <section className="filter-section" aria-label="Bộ lọc">
      <div className="container">
        <div className="filter-bar">
          {label && (
            <span className="filter-bar__label">
              {labelIcon ?? <Filter size={14} aria-hidden />}
              {label}
            </span>
          )}

          <div className="filter-bar__items" role="tablist">
            {options.map((opt, idx) => {
              const isActive = active === opt.id;
              return (
                <button
                  key={opt.id ?? `filter-opt-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`filter-bar__item ${isActive ? 'active' : ''}`}
                  onClick={() => onChange(opt.id)}
                >
                  {opt.icon && <i className={`filter-bar__icon ${opt.icon}`} aria-hidden />}
                  <span className="filter-bar__label-text">{opt.label}</span>
                  {typeof opt.count === 'number' && (
                    <span className="filter-bar__count">{opt.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {typeof resultCount === 'number' && (
            <span className="filter-bar__result" aria-live="polite">
              <strong>{resultCount}</strong>
              {resultLabel && <span> {resultLabel}</span>}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
