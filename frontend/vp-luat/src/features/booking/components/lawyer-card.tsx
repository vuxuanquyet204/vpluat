'use client';

import { useState } from 'react';
import { Check, Circle, Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookingLawyerOption } from '../types';

function ratingIcons(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return Array.from({ length: 5 }).map((_, index) => {
    if (index < fullStars) {
      return <Star key={index} className="h-[0.65rem] w-[0.65rem] fill-[var(--accent)] text-[var(--accent)]" />;
    }

    if (index === fullStars && hasHalf) {
      return (
        <StarHalf key={index} className="h-[0.65rem] w-[0.65rem] fill-[var(--accent)] text-[var(--accent)]" />
      );
    }

    return <Star key={index} className="h-[0.65rem] w-[0.65rem] text-[var(--gray-300)]" />;
  });
}

export function LawyerCard({
  lawyer,
  selected,
  onSelect,
}: {
  lawyer: BookingLawyerOption;
  selected: boolean;
  onSelect: (lawyer: BookingLawyerOption) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(lawyer.avatarUrl) && !imageFailed;

  return (
    <button
      type="button"
      onClick={() => onSelect(lawyer)}
      aria-pressed={selected}
      className={cn(
        'relative cursor-pointer rounded-[var(--radius-lg)] border-2 bg-white px-4 py-5 text-center transition-all duration-200',
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
        className="relative mx-auto mb-3 block h-16 w-16 overflow-hidden rounded-full border-2 border-white/30"
        style={!showImage ? { background: lawyer.avatarGradient } : undefined}
      >
        {showImage ? (
          <img
            src={lawyer.avatarUrl}
            alt={lawyer.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-heading text-[1.3rem] font-bold text-white">
            {lawyer.initials}
          </span>
        )}
      </span>
      <span className="mb-1 block text-[0.875rem] font-bold text-[var(--primary)]">{lawyer.name}</span>
      <span className="mb-2 block text-[0.75rem] text-[var(--gray-500)]">{lawyer.specialty}</span>
      {typeof lawyer.rating === 'number' && (
        <span
          className="mb-2 flex items-center justify-center gap-[3px] text-[0.75rem] text-[var(--gray-500)]"
          aria-label={`Đánh giá ${lawyer.rating.toFixed(1)} trên 5${lawyer.reviewCount ? `, ${lawyer.reviewCount} lượt` : ''}`}
        >
          {ratingIcons(lawyer.rating)}
          <span>{lawyer.rating.toFixed(1)}</span>
          {typeof lawyer.reviewCount === 'number' && (
            <span className="text-[var(--gray-400)]">({lawyer.reviewCount})</span>
          )}
        </span>
      )}
      {lawyer.availabilityLabel && (
        <span
          className={cn(
            'inline-flex items-center gap-[5px] rounded-[var(--radius-full)] px-[10px] py-[3px] text-[0.72rem] font-semibold',
            lawyer.isAvailableToday === false
              ? 'bg-[var(--gray-100)] text-[var(--gray-500)]'
              : 'bg-[var(--success-bg)] text-[var(--success)]',
          )}
        >
          <Circle
            className="h-[0.55rem] w-[0.55rem] fill-current"
          />
          {lawyer.availabilityLabel}
        </span>
      )}
    </button>
  );
}
