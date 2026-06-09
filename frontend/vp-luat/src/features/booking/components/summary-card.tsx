'use client';

import { Briefcase, CalendarDays, Clock3, ClipboardList, LocateFixed, ShieldCheck, UserRound } from 'lucide-react';
import { formatBookingDateLabel } from '../utils';
import { SlotReservationTimer } from './slot-reservation-timer';
import { useBookingStore } from '../hooks';

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex gap-3 border-b border-[var(--gray-100)] py-2.5 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-faint)] text-[var(--primary)]">
        {icon}
      </div>
      <div>
        <div className="mb-0.5 text-[0.72rem] text-[var(--gray-500)]">{label}</div>
        <div className="text-[0.85rem] font-semibold leading-[1.3] text-[var(--primary)]">
          {value || <span className="font-normal text-[var(--gray-400)]">Chưa chọn</span>}
        </div>
      </div>
    </div>
  );
}

export function SummaryCard({ onReservationExpire }: { onReservationExpire: () => void }) {
  const service = useBookingStore((state) => state.service);
  const lawyer = useBookingStore((state) => state.lawyer);
  const date = useBookingStore((state) => state.date);
  const timeSlot = useBookingStore((state) => state.timeSlot);
  const consultationType = useBookingStore((state) => state.consultationType);
  const reservation = useBookingStore((state) => state.reservation);

  const parsedDate = date ? new Date(date) : null;
  const methodMap: Record<string, string> = {
    office: 'Tại văn phòng',
    video: 'Online (Video call)',
    phone: 'Qua điện thoại',
  };

  return (
    <aside className="rounded-[var(--radius-xl)] border border-[var(--gray-100)] bg-white p-6 shadow-[var(--shadow-sm)] md:sticky md:top-6">
      <div className="mb-[18px] flex items-center gap-2 border-b-2 border-[var(--accent)] pb-[14px] font-heading text-[1.05rem] font-bold text-[var(--primary)]">
        <ClipboardList className="h-4 w-4 text-[var(--accent)]" />
        <span>Tóm tắt lịch hẹn</span>
      </div>

      <SummaryRow icon={<Briefcase className="h-4 w-4" />} label="Dịch vụ" value={service?.name ?? null} />
      <SummaryRow icon={<UserRound className="h-4 w-4" />} label="Luật sư" value={lawyer?.name ?? null} />
      <SummaryRow
        icon={<CalendarDays className="h-4 w-4" />}
        label="Ngày"
        value={parsedDate ? formatBookingDateLabel(parsedDate) : null}
      />
      <SummaryRow icon={<Clock3 className="h-4 w-4" />} label="Giờ" value={timeSlot?.startTime ?? null} />
      <SummaryRow
        icon={<LocateFixed className="h-4 w-4" />}
        label="Hình thức"
        value={methodMap[consultationType] ?? null}
      />

      <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--success-bg)] p-3.5 text-center">
        <div className="mb-0.5 text-[0.78rem] text-[var(--gray-500)]">Phí tư vấn lần đầu</div>
        <div className="font-heading text-[1.5rem] font-bold text-[var(--success)]">MIỄN PHÍ</div>
      </div>

      <SlotReservationTimer
        expiresAt={reservation?.expiresAt ?? null}
        onExpire={onReservationExpire}
      />

      <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.72rem] text-[var(--gray-400)]">
        <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
        <span>Thông tin của bạn được bảo mật 100%</span>
      </div>
    </aside>
  );
}
