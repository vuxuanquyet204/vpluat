'use client';

import { ArrowRight } from 'lucide-react';
import { BOOKING_SERVICES } from '../lib';
import { trackBookingLawyerSelected, trackBookingServiceSelected } from '../analytics';
import { useBookingStore, useLawyersQuery } from '../hooks';
import { ServiceGrid } from './service-grid';
import { LawyerSection } from './lawyer-section';
import type { BookingLawyerOption } from '../types';

function toBookingLawyerOption(lawyer: { id: string; nameVi?: string; nameEn?: string; positionVi?: string; avatarUrl?: string; isFeatured?: boolean }): BookingLawyerOption {
  const name = lawyer.nameVi || lawyer.nameEn || 'Luật sư';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const gradients = [
    'linear-gradient(135deg, #1E3A5F, #2A4F7A)',
    'linear-gradient(135deg, #2A4F7A, #C9A84C)',
    'linear-gradient(135deg, #152A45, #1E3A5F)',
    'linear-gradient(135deg, #3B2F7A, #6B4FA0)',
    'linear-gradient(135deg, #1A4A3A, #2E7D5E)',
  ];
  const gradientIndex = parseInt(lawyer.id.replace(/-/g, '').slice(0, 8), 16) % gradients.length;

  return {
    id: lawyer.id,
    name,
    initials,
    specialty: lawyer.positionVi || '',
    rating: 5.0,
    availabilityLabel: 'Còn lịch hôm nay',
    avatarGradient: gradients[gradientIndex],
  };
}

export function StepService({ onNext }: { onNext: () => void }) {
  const service = useBookingStore((state) => state.service);
  const lawyer = useBookingStore((state) => state.lawyer);
  const setService = useBookingStore((state) => state.setService);
  const setLawyer = useBookingStore((state) => state.setLawyer);

  const { data: rawLawyers = [] } = useLawyersQuery();
  const bookingLawyers: BookingLawyerOption[] = rawLawyers.map(toBookingLawyerOption);

  const canProceed = Boolean(service && lawyer);

  const handleSelectService = (svc: typeof service) => {
    if (svc) {
      setService(svc);
      trackBookingServiceSelected(svc.slug, svc.id);
    }
  };

  const handleSelectLawyer = (l: BookingLawyerOption) => {
    if (l) {
      setLawyer(l);
      trackBookingLawyerSelected(l.id, l.name);
    }
  };

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
        onSelect={handleSelectService}
      />

      <LawyerSection
        lawyers={bookingLawyers}
        visible={Boolean(service)}
        selectedLawyerId={lawyer?.id ?? null}
        onSelect={handleSelectLawyer}
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
