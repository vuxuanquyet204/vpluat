'use client';

import { Bell, CalendarPlus, Check, Clock3, House, LocateFixed, Phone, UserRound } from 'lucide-react';
import { useMemo } from 'react';
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
  const service = useBookingStore((state) => state.service);
  const lawyer = useBookingStore((state) => state.lawyer);
  const date = useBookingStore((state) => state.date);
  const timeSlot = useBookingStore((state) => state.timeSlot);
  const consultationType = useBookingStore((state) => state.consultationType);
  const customerInfo = useBookingStore((state) => state.customerInfo);
  const confirmation = useBookingStore((state) => state.confirmation);

  const methodMap: Record<string, string> = {
    office: 'Tại văn phòng',
    video: 'Online (Video call)',
    phone: 'Qua điện thoại',
  };

  const formattedDate = useMemo(() => {
    if (!date) {
      return 'Chưa chọn';
    }

    return formatBookingDateLabel(new Date(date));
  }, [date]);

  return (
    <section className="mx-auto max-w-[600px] animate-in fade-in slide-in-from-right-1 py-5 text-center duration-300">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]">
        <Check className="h-8 w-8" />
      </div>
      <h2 className="mb-2.5 font-heading text-[2rem] font-bold text-[var(--primary)]">Đặt lịch thành công!</h2>
      <p className="mb-7 text-[0.9rem] text-[var(--gray-500)]">
        Cảm ơn bạn đã đặt lịch tư vấn. Dưới đây là thông tin lịch hẹn của bạn.
      </p>

      <div className="mb-6 rounded-[var(--radius-xl)] border border-[var(--gray-100)] bg-white p-7 text-left shadow-[var(--shadow-md)]">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--gray-100)] pb-4">
          <div>
            <div className="mb-0.5 text-[0.72rem] text-[var(--gray-500)]">Mã đặt lịch</div>
            <div className="text-[1rem] font-bold text-[var(--primary)]">{confirmation?.bookingId}</div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-[var(--success-bg)] px-3 py-1 text-[0.75rem] font-bold text-[var(--success)]">
            <Check className="h-3.5 w-3.5" />
            <span>Đã xác nhận</span>
          </div>
        </div>

        <ReceiptRow icon={<UserRound className="h-4 w-4" />} label="Khách hàng" value={customerInfo.fullName} />
        <ReceiptRow icon={<Phone className="h-4 w-4" />} label="Liên hệ" value={customerInfo.phone} />
        <ReceiptRow icon={<CalendarPlus className="h-4 w-4" />} label="Dịch vụ" value={service?.name ?? 'Chưa chọn'} />
        <ReceiptRow icon={<UserRound className="h-4 w-4" />} label="Luật sư" value={lawyer?.name ?? 'Chưa chọn'} />
        <ReceiptRow icon={<CalendarPlus className="h-4 w-4" />} label="Ngày" value={formattedDate} />
        <ReceiptRow icon={<Clock3 className="h-4 w-4" />} label="Giờ" value={timeSlot?.startTime ?? 'Chưa chọn'} />
        <ReceiptRow
          icon={<LocateFixed className="h-4 w-4" />}
          label="Hình thức"
          value={methodMap[consultationType] ?? 'Chưa chọn'}
        />
      </div>

      <div className="mb-6 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary-faint)] px-5 py-3 text-[0.85rem] text-[var(--gray-500)]">
        <Bell className="h-4 w-4 text-[var(--primary)]" />
        <span>Chúng tôi sẽ xác nhận qua SMS và email trong vòng 15 phút.</span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-md:flex-col">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 py-3 text-[0.875rem] font-bold text-white transition hover:-translate-y-px hover:bg-[var(--primary-dark)]"
        >
          <CalendarPlus className="h-4 w-4" />
          <span>Thêm vào Google Calendar</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--primary)] px-6 py-3 text-[0.875rem] font-bold text-[var(--primary)] transition hover:bg-[var(--primary-faint)]"
        >
          <House className="h-4 w-4" />
          <span>Đặt lịch mới</span>
        </button>
      </div>
    </section>
  );
}
