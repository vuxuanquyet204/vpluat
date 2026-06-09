'use client';

import { ArrowRight } from 'lucide-react';
import { BOOKING_LAWYERS, BOOKING_SERVICES } from '../lib';
import { useBookingStore } from '../hooks';
import { ServiceGrid } from './service-grid';
import { LawyerSection } from './lawyer-section';

export function StepService({ onNext }: { onNext: () => void }) {
  const service = useBookingStore((state) => state.service);
  const lawyer = useBookingStore((state) => state.lawyer);
  const setService = useBookingStore((state) => state.setService);
  const setLawyer = useBookingStore((state) => state.setLawyer);

  const canProceed = Boolean(service && lawyer);

  return (
    <section className="animate-in fade-in slide-in-from-right-1 duration-300">
      <h2 className="mb-1.5 font-heading text-[1.5rem] font-bold text-[var(--primary)]">
        Bạn cần tư vấn về lĩnh vực nào?
      </h2>
      <p className="mb-7 text-[0.875rem] text-[var(--gray-500)]">
        Chọn lĩnh vực pháp lý bạn cần hỗ trợ để được kết nối với luật sư chuyên môn.
      </p>

      <ServiceGrid
        services={BOOKING_SERVICES}
        selectedServiceId={service?.id ?? null}
        onSelect={setService}
      />

      <LawyerSection
        lawyers={BOOKING_LAWYERS}
        visible={Boolean(service)}
        selectedLawyerId={lawyer?.id ?? null}
        onSelect={setLawyer}
      />

      <div className="mt-8 flex justify-end border-t border-[var(--gray-100)] pt-6">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-7 py-[11px] text-[0.875rem] font-bold text-[var(--primary-dark)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--accent-dark)] hover:shadow-[0_4px_15px_rgba(201,168,76,0.3)] disabled:cursor-not-allowed disabled:bg-[var(--gray-200)] disabled:text-[var(--gray-400)] disabled:shadow-none"
        >
          <span>Tiếp theo</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
