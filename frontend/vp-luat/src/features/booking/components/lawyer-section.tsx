'use client';

import { cn } from '@/lib/utils';
import { LawyerGrid } from './lawyer-grid';
import type { BookingLawyerOption } from '../types';

export function LawyerSection({
  lawyers,
  visible,
  selectedLawyerId,
  onSelect,
}: {
  lawyers: BookingLawyerOption[];
  visible: boolean;
  selectedLawyerId: string | null;
  onSelect: (lawyer: BookingLawyerOption) => void;
}) {
  return (
    <section
      className={cn(
        'hidden pt-7',
        visible && 'block animate-in fade-in slide-in-from-bottom-4 duration-300',
      )}
    >
      <h3 className="mb-[18px] border-t border-[var(--gray-100)] pt-7 font-heading text-[1.15rem] font-bold text-[var(--primary)]">
        Chọn luật sư bạn muốn tư vấn
      </h3>
      <LawyerGrid
        lawyers={lawyers}
        selectedLawyerId={selectedLawyerId}
        onSelect={onSelect}
      />
    </section>
  );
}
