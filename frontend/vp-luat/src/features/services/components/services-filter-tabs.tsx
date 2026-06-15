'use client';

import { SERVICE_CATEGORIES } from '../lib/data/services-data';
import type { ServiceCategory } from '../types';

interface FilterTabsProps {
  active: 'all' | ServiceCategory;
  onChange: (value: 'all' | ServiceCategory) => void;
}

export function ServicesFilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <section className="filter-section">
      <div className="container">
        <div className="filter-tabs">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-tab ${active === cat.id ? 'active' : ''}`}
              onClick={() => onChange(cat.id)}
              aria-pressed={active === cat.id}
            >
              <i className={`filter-tab__icon ${cat.icon}`} aria-hidden="true" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
