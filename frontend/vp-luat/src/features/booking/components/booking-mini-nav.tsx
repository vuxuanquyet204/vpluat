'use client';

import { Scale, PhoneCall } from 'lucide-react';

export function BookingMiniNav() {
  return (
    <header className="bg-[var(--primary)] px-6 py-0">
      <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--primary-dark)]">
            <Scale className="h-4 w-4" />
          </div>
          <span className="font-heading text-[0.95rem] font-bold text-white max-[480px]:hidden">
            VP Luật Hùng & Cộng sự
          </span>
        </div>
        <a
          href="tel:19001234"
          className="inline-flex items-center gap-2 text-[0.9rem] font-bold text-[var(--accent)]"
        >
          <PhoneCall className="h-[0.85rem] w-[0.85rem]" />
          <span>1900 1234</span>
        </a>
      </div>
    </header>
  );
}
