'use client';

import { useState, useEffect } from 'react';
import { Modal, Drawer } from '@/features/shared/ui/modal';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import { bookingApi, type Appointment } from '@/lib/api/admin-booking';
import { notifySuccess, notifyError } from '@/features/admin/lib';
import { Save, Loader2, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface BookingActionDrawerProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
  onUpdated?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xác nhận', color: '#D97706', bg: '#FEF3C7' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: '#2563EB', bg: '#EFF6FF' },
  { value: 'COMPLETED', label: 'Hoàn tất', color: '#059669', bg: '#ECFDF5' },
  { value: 'CANCELLED', label: 'Đã hủy', color: '#DC2626', bg: '#FEE2E2' },
];

function formatDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: iso, time: '' };
  }
}

export function BookingActionDrawer({ open, onClose, bookingId, onUpdated }: BookingActionDrawerProps) {
  const { data: booking, isLoading, refetch } = useApiQuery<Appointment>(
    ['staff-booking-detail', bookingId],
    `/bookings/${bookingId}`,
    {},
    { enabled: open && !!bookingId }
  );

  const updateStatusMutation = useApiMutation<Appointment, { status: string; notes?: string }>(
    'PATCH',
    (vars) => `/bookings/${bookingId}/status`,
    {
      onSuccess: () => {
        notifySuccess('Đã cập nhật trạng thái');
        onUpdated?.();
        refetch();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const cancelMutation = useApiMutation<Appointment, { reason?: string }>(
    'POST',
    (vars) => `/bookings/${bookingId}/cancel?reason=${encodeURIComponent(vars.reason ?? '')}`,
    {
      onSuccess: () => {
        notifySuccess('Đã hủy lịch hẹn');
        onUpdated?.();
        onClose();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const rescheduleMutation = useApiMutation<Appointment, { newScheduledAt: string; reason?: string }>(
    'POST',
    (vars) => `/bookings/${bookingId}/reschedule`,
    {
      onSuccess: () => {
        notifySuccess('Đã đổi lịch');
        onUpdated?.();
        refetch();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (booking?.scheduledAt) {
      const { date, time } = formatDateTime(booking.scheduledAt);
      setNewDate(date.split('/').reverse().join('-')); // YYYY-MM-DD
      setNewTime(time);
    }
  }, [booking?.scheduledAt]);

  if (isLoading) {
    return (
      <Drawer open={open} onClose={onClose} title="Chi tiết lịch hẹn" width={520}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>Đang tải...</div>
      </Drawer>
    );
  }

  if (!booking) {
    return (
      <Drawer open={open} onClose={onClose} title="Chi tiết lịch hẹn" width={520}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>Không tìm thấy</div>
      </Drawer>
    );
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === booking.status) ?? {
    value: booking.status,
    label: booking.status,
    color: '#6B7280',
    bg: '#F3F4F6',
  };
  const { date, time } = formatDateTime(booking.scheduledAt);

  const handleConfirm = () => {
    updateStatusMutation.mutate({ status: 'CONFIRMED' });
  };

  const handleComplete = () => {
    updateStatusMutation.mutate({ status: 'COMPLETED' });
  };

  const handleReschedule = () => {
    if (!newDate || !newTime) {
      notifyError('Vui lòng chọn ngày giờ mới');
      return;
    }
    const iso = new Date(`${newDate}T${newTime}:00`).toISOString();
    rescheduleMutation.mutate({ newScheduledAt: iso, reason: 'Rescheduled by staff' });
  };

  return (
    <Drawer open={open} onClose={onClose} title="Chi tiết lịch hẹn" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            padding: 16,
            background: 'var(--gray-50)',
            borderRadius: 8,
            border: '1px solid var(--gray-200)',
          }}
        >
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>
            {booking.clientName}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' }}>
            <div>📞 {booking.clientPhone}</div>
            <div>✉️ {booking.clientEmail}</div>
            <div>📋 Dịch vụ: {booking.serviceName ?? '—'}</div>
            <div>👨‍⚖️ Luật sư: {booking.lawyerName ?? '—'}</div>
            <div>📅 {date} - {time}</div>
            <div style={{ marginTop: 6 }}>
              <span
                style={{
                  padding: '4px 10px',
                  background: currentStatus.bg,
                  color: currentStatus.color,
                  borderRadius: 20,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {booking.status === 'PENDING' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={updateStatusMutation.isPending}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckCircle size={14} /> Xác nhận
            </button>
            <button
              type="button"
              onClick={() => {
                const reason = prompt('Lý do hủy?');
                if (reason) cancelMutation.mutate({ reason });
              }}
              disabled={cancelMutation.isPending}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <XCircle size={14} /> Hủy lịch
            </button>
          </div>
        )}

        {booking.status === 'CONFIRMED' && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={updateStatusMutation.isPending}
            style={{
              padding: '10px 16px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <CheckCircle size={14} /> Đánh dấu hoàn tất
          </button>
        )}

        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>
              <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
              Đổi lịch
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                }}
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleReschedule}
              disabled={rescheduleMutation.isPending}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'white',
                color: 'var(--primary, #1E3A5F)',
                border: '1px solid var(--primary, #1E3A5F)',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Cập nhật lịch mới
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}

interface BookingCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function BookingCreateModal({ open, onClose, onCreated }: BookingCreateModalProps) {
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    scheduledAt: '',
    durationMinutes: 60,
    meetingType: 'OFFICE',
  });

  useEffect(() => {
    if (open) {
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      setForm({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        scheduledAt: now.toISOString().slice(0, 16),
        durationMinutes: 60,
        meetingType: 'OFFICE',
      });
    }
  }, [open]);

  const createMutation = useApiMutation<Appointment, unknown>(
    'POST',
    '/bookings/admin',
    {
      onSuccess: () => {
        notifySuccess('Đã tạo lịch hẹn mới');
        onCreated?.();
        onClose();
      },
      onError: (err) => notifyError('Lỗi tạo lịch', err.message),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      notifyError('Vui lòng nhập tên khách');
      return;
    }
    if (!form.scheduledAt) {
      notifyError('Vui lòng chọn ngày giờ');
      return;
    }
    createMutation.mutate({
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      durationMinutes: form.durationMinutes,
      meetingType: form.meetingType,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo lịch hẹn mới"
      width={520}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--gray-200)',
              background: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="booking-create-form"
            disabled={createMutation.isPending}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--primary, #1E3A5F)',
              color: 'white',
              borderRadius: 6,
              cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: createMutation.isPending ? 0.7 : 1,
            }}
          >
            {createMutation.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            Tạo lịch
          </button>
        </>
      }
    >
      <form id="booking-create-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Họ tên khách *" required>
            <input
              type="text"
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              style={inputStyle}
              placeholder="Nguyễn Văn A"
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Số điện thoại">
              <input
                type="tel"
                value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                style={inputStyle}
                placeholder="0901234567"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                style={inputStyle}
                placeholder="email@example.com"
              />
            </Field>
          </div>
          <Field label="Ngày giờ hẹn *" required>
            <input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              style={inputStyle}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Thời lượng (phút)">
              <input
                type="number"
                min={15}
                step={15}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                style={inputStyle}
              />
            </Field>
            <Field label="Hình thức">
              <select
                value={form.meetingType}
                onChange={(e) => setForm({ ...form, meetingType: e.target.value })}
                style={inputStyle}
              >
                <option value="OFFICE">Tại văn phòng</option>
                <option value="ONLINE">Online</option>
                <option value="PHONE">Điện thoại</option>
              </select>
            </Field>
          </div>
        </div>
      </form>
    </Modal>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--gray-200)',
  borderRadius: 6,
  fontSize: '0.88rem',
  outline: 'none',
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}