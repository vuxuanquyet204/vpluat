'use client';

import { Briefcase, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookingStep } from '../types';

const PROGRESS_STEPS: Array<{
  id: BookingStep;
  label: string;
  icon: typeof Briefcase;
}> = [
  { id: 'service', label: 'Chọn dịch vụ', icon: Briefcase },
  { id: 'datetime', label: 'Chọn lịch', icon: CalendarDays },
  { id: 'info', label: 'Thông tin', icon: User },
];

function getProgressMeta(step: BookingStep) {
  switch (step) {
    case 'service':
      return { activeIndex: 0, fill: '0%' };
    case 'datetime':
      return { activeIndex: 1, fill: '50%' };
    case 'info':
    case 'confirmation':
      return { activeIndex: 2, fill: '100%' };
    default:
      return { activeIndex: 0, fill: '0%' };
  }
}

export function BookingProgress({ step }: { step: BookingStep }) {
  const { activeIndex, fill } = getProgressMeta(step);

  return (
    <div className="border-b border-[var(--gray-100)] bg-white px-6 pt-6">
      <div className="relative mx-auto flex max-w-[700px] items-start">
        <div className="absolute left-[calc(50%/3)] right-[calc(50%/3)] top-5 h-0.5 bg-[var(--gray-200)]">
          <div
            className="h-full bg-[var(--primary)] transition-[width] duration-500 ease-in-out"
            style={{ width: fill }}
          />
        </div>
        {PROGRESS_STEPS.map((progressStep, index) => {
          const Icon = progressStep.icon;
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <div
              key={progressStep.id}
              className="relative z-[1] flex flex-1 flex-col items-center gap-2 text-center"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-[0.85rem] font-bold transition-all duration-300',
                  isDone && 'border-[var(--success)] bg-[var(--success)] text-white',
                  isActive &&
                    'border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_0_0_4px_rgba(30,58,95,0.12)]',
                  !isDone && !isActive && 'border-[var(--gray-200)] bg-white text-[var(--gray-400)]',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'pb-5 text-[0.75rem] font-semibold transition-colors duration-300 max-[480px]:text-[0.68rem]',
                  isDone && 'text-[var(--success)]',
                  isActive && 'text-[var(--primary)]',
                  !isDone && !isActive && 'text-[var(--gray-400)]',
                )}
              >
                {progressStep.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
