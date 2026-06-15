'use client';

import { SPECIALTY_FILTERS } from '../lib/data/lawyers-data';
import type { LawyerSpecialty } from '../types';

interface LawyersFilterChipsProps {
  active: 'all' | LawyerSpecialty;
  onChange: (value: 'all' | LawyerSpecialty) => void;
}

export function LawyersFilterChips({ active, onChange }: LawyersFilterChipsProps) {
  return (
    <section className="filter-section">
      <div className="container">
        <div className="filter-inner">
          <span className="filter-label">
            <i className="fa-solid fa-filter" aria-hidden="true" />
            Lọc theo chuyên môn
          </span>
          <div className="filter-pills">
            {SPECIALTY_FILTERS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`filter-pill ${active === s.id ? 'active' : ''}`}
                onClick={() => onChange(s.id)}
                aria-pressed={active === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
