'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookingIcon } from './booking-icon';
import type { BookingServiceOption } from '../types';

export function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: BookingServiceOption;
  selected: boolean;
  onSelect: (service: BookingServiceOption) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      aria-pressed={selected}
      className={cn(
        'relative cursor-pointer rounded-[var(--radius-lg)] border-2 bg-white px-[14px] py-5 text-center transition-all duration-200',
        selected
          ? 'border-[var(--accent)] bg-[#FEF9EF] shadow-[0_0_0_1px_var(--accent)]'
          : 'border-[var(--gray-200)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)]',
      )}
    >
      <span
        className={cn(
          'absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white',
          selected && 'flex',
        )}
      >
        <Check className="h-3 w-3" />
      </span>
      <span
        className={cn(
          'mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] transition-all duration-200',
          selected
            ? 'bg-[rgba(201,168,76,0.15)] text-[var(--accent-dark)]'
            : 'bg-[var(--primary-faint)] text-[var(--primary)]',
        )}
      >
        <BookingIcon name={service.icon} className="h-[1.1rem] w-[1.1rem]" />
      </span>
      <span className="block text-[0.8rem] font-bold leading-[1.3] text-[var(--primary)]">
        {service.name}
      </span>
    </button>
  );
}
