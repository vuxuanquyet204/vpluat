'use client';

import type { BookingLawyerOption } from '../types';
import { LawyerCard } from './lawyer-card';

export function LawyerGrid({
  lawyers,
  selectedLawyerId,
  onSelect,
}: {
  lawyers: BookingLawyerOption[];
  selectedLawyerId: string | null;
  onSelect: (lawyer: BookingLawyerOption) => void;
}) {
  return (
    <div className="grid gap-4 min-[481px]:grid-cols-2 xl:grid-cols-3">
      {lawyers.map((lawyer) => (
        <LawyerCard
          key={lawyer.id}
          lawyer={lawyer}
          selected={lawyer.id === selectedLawyerId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
