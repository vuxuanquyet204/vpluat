'use client';

import { Bell, CalendarPlus, Check, Clock3, House, LocateFixed, Phone, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useBookingStore } from '../hooks';
import { formatBookingDateLabel } from '../utils';

function ReceiptRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 border-b border-[var(--gray-50)] py-2.5 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-faint)] text-[var(--primary)]">
        {icon}
      </div>
      <div>
        <div className="text-[0.75rem] text-[var(--gray-500)]">{label}</div>
        <div className="text-[0.875rem] font-semibold text-[var(--primary)]">{value}</div>
      </div>
    </div>
  );
}

export function StepConfirmation({ onReset }: { onReset: () => void }) {
  const t = useTranslations('booking');
  const service = useBookingStore((state) => state.service);
  const lawyer = useBookingStore((state) => state.lawyer);
  const date = useBookingStore((state) => state.date);
  const timeSlot = useBookingStore((state) => state.timeSlot);
  const consultationType = useBookingStore((state) => state.consultationType);
  const customerInfo = useBookingStore((state) => state.customerInfo);
  const confirmation = useBookingStore((state) => state.confirmation);

  const methodMap: Record<string, string> = {
    office: t('consultation.office'),
    video: t('consultation.video'),
    phone: t('consultation.phone'),
  };

  const formattedDate = useMemo(() => {
    if (!date) {
      return t('notSelected');
    }

    return formatBookingDateLabel(new Date(date));
  }, [date]);

  const handleAddToGoogleCalendar = () => {
    if (!confirmation || !date || !timeSlot) return;
    const start = new Date(date);
    const [hh, mm] = timeSlot.startTime.split(':').map(Number);
    if (!Number.isFinite(hh)) return;
    start.setHours(hh, mm ?? 0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const toGcal = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

    const title = encodeURIComponent(`${t('calendarTitle')} - ${service?.name ?? t('firmName')}`);
    const details = encodeURIComponent(
      `${t('calendarDetails', { lawyer: lawyer?.name ?? '', bookingId: confirmation.bookingId })}`,
    );
    const location = encodeURIComponent(
      consultationType === 'office'
        ? t('calendarOffice')
        : consultationType === 'video'
          ? t('calendarVideo')
          : t('calendarPhone'),
    );

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${toGcal(start)}/${toGcal(end)}&details=${details}&location=${location}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="mx-auto max-w-[600px] animate-in fade-in slide-in-from-right-1 py-5 text-center duration-300">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]">
        <Check className="h-8 w-8" />
      </div>
      <h2 className="mb-2.5 font-heading text-[2rem] font-bold text-[var(--primary)]">{t('successTitle')}</h2>
      <p className="mb-7 text-[0.9rem] text-[var(--gray-500)]">
        {t('successSubtitle')}
      </p>

      <div className="mb-6 rounded-[var(--radius-xl)] border border-[var(--gray-100)] bg-white p-7 text-left shadow-[var(--shadow-md)]">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--gray-100)] pb-4">
          <div>
            <div className="mb-0.5 text-[0.72rem] text-[var(--gray-500)]">{t('bookingCode')}</div>
            <div className="text-[1rem] font-bold text-[var(--primary)]">{confirmation?.bookingId}</div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-[var(--success-bg)] px-3 py-1 text-[0.75rem] font-bold text-[var(--success)]">
            <Check className="h-3.5 w-3.5" />
            <span>{t('confirmed')}</span>
          </div>
        </div>

        <ReceiptRow icon={<UserRound className="h-4 w-4" />} label={t('customer')} value={customerInfo.fullName} />
        <ReceiptRow icon={<Phone className="h-4 w-4" />} label={t('contact')} value={customerInfo.phone} />
        <ReceiptRow icon={<CalendarPlus className="h-4 w-4" />} label={t('serviceLabel')} value={service?.name ?? t('notSelected')} />
        <ReceiptRow icon={<UserRound className="h-4 w-4" />} label={t('lawyerLabel')} value={lawyer?.name ?? t('notSelected')} />
        <ReceiptRow icon={<CalendarPlus className="h-4 w-4" />} label={t('dateLabel')} value={formattedDate} />
        <ReceiptRow icon={<Clock3 className="h-4 w-4" />} label={t('timeLabel')} value={timeSlot?.startTime ?? t('notSelected')} />
        <ReceiptRow
          icon={<LocateFixed className="h-4 w-4" />}
          label={t('consultationLabel')}
          value={methodMap[consultationType] ?? t('notSelected')}
        />
      </div>

      <div className="mb-6 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary-faint)] px-5 py-3 text-[0.85rem] text-[var(--gray-500)]">
        <Bell className="h-4 w-4 text-[var(--primary)]" />
        <span>{t('emailConfirmation')}</span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-md:flex-col">
        <button
          type="button"
          onClick={handleAddToGoogleCalendar}
          disabled={!confirmation}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 py-3 text-[0.875rem] font-bold text-white transition hover:-translate-y-px hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarPlus className="h-4 w-4" />
          <span>{t('addToCalendar')}</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--primary)] px-6 py-3 text-[0.875rem] font-bold text-[var(--primary)] transition hover:bg-[var(--primary-faint)]"
        >
          <House className="h-4 w-4" />
          <span>{t('newBooking')}</span>
        </button>
      </div>
    </section>
  );
}
