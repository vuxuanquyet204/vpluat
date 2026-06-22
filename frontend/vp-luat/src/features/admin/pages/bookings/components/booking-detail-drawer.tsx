'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, Check, X, UserPlus, SendHorizontal } from 'lucide-react';
import { Drawer, ConfirmDialog, FormFieldTextarea } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import {
  useUpdateBooking,
  useChangeBookingStatus,
  useRescheduleBooking,
  useDeleteBooking,
  useUpdateReminders,
  useSendConfirmationEmail,
} from '../hooks/use-booking-mutations';
import { bookingApi, type BookingHistoryEntry, type ReminderConfig } from '@/lib/api/admin-booking';
import { useCan } from '@/features/admin/lib';
import type { Booking, BookingStatus } from '@/features/admin/types';

const STATUS_MAP: Record<BookingStatus, { label: string; variant: StatusVariant }> = {
  pending: { label: 'Chờ xác nhận', variant: 'yellow' },
  confirmed: { label: 'Đã xác nhận', variant: 'blue' },
  completed: { label: 'Hoàn tất', variant: 'green' },
  cancelled: { label: 'Đã hủy', variant: 'red' },
};

const METHOD_LABELS: Record<string, string> = {
  office: 'Tại Văn Phòng',
  online: 'Online (Zoom/Meet)',
  phone: 'Qua Điện thoại',
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  office: <MapPin size={12} />,
  online: <Calendar size={12} />,
  phone: <Phone size={12} />,
};

interface BookingDetailDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onDeleted: () => void;
  onCreateLead?: (b: Booking) => void;
}

export function BookingDetailDrawer({ booking, onClose, onDeleted, onCreateLead }: BookingDetailDrawerProps) {
  const canEdit = useCan('booking.write');
  const canDelete = useCan('booking.delete');
  const qc = useQueryClient();

  const update = useUpdateBooking();
  const changeStatus = useChangeBookingStatus();
  const reschedule = useRescheduleBooking();
  const remove = useDeleteBooking();
  const updateReminders = useUpdateReminders();
  const sendEmail = useSendConfirmationEmail();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<'info' | 'history' | 'reminder'>('info');

  // Fetch history from API
  const { data: history = [] } = useQuery({
    queryKey: ['booking-history', booking?.id],
    queryFn: () => (booking?.id ? bookingApi.getHistory(booking.id) : Promise.resolve([])),
    enabled: Boolean(booking?.id) && tab === 'history',
  });

  // Fetch reminder config from API
  const { data: reminderConfig } = useQuery({
    queryKey: ['booking-reminders', booking?.id],
    queryFn: () => (booking?.id ? bookingApi.getReminders(booking.id) : Promise.resolve(null)),
    enabled: Boolean(booking?.id) && tab === 'reminder',
  });

  const handleReminderToggle = (type: string, enabled: boolean) => {
    if (!booking?.id || !reminderConfig) return;
    const updated = reminderConfig.reminders.map((r) =>
      r.type === type ? { ...r, enabled } : r,
    );
    // Update cache immediately for responsive UI
    qc.setQueryData(['booking-reminders', booking.id], {
      appointmentId: booking.id,
      reminders: updated,
    });
    updateReminders.mutate({ id: booking.id, reminders: updated });
  };

  if (!booking) return null;

  const status = STATUS_MAP[booking.status];

  const handleConfirm = () => changeStatus.mutate({ id: booking.id, status: 'confirmed' });
  const handleComplete = () => changeStatus.mutate({ id: booking.id, status: 'completed' });

  const handleCancel = () => {
    if (cancelReason.trim().length < 2) return;
    changeStatus.mutate(
      { id: booking.id, status: 'cancelled', cancelledReason: cancelReason },
      { onSuccess: () => setConfirmCancel(false) },
    );
  };

  const handleDelete = () => {
    remove.mutate(booking.id, {
      onSuccess: () => {
        onDeleted();
        setConfirmDelete(false);
      },
    });
  };

  return (
    <>
      <Drawer
        isOpen={Boolean(booking)}
        onClose={onClose}
        width={480}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{booking.customerName}</span>
            <StatusBadge label={status.label} variant={status.variant} />
          </div>
        }
        footer={
          <>
            {canDelete && (
              <button
                type="button"
                className="action-btn action-btn--danger"
                onClick={() => setConfirmDelete(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}
              >
                <X size={12} /> Xóa
              </button>
            )}
            {canEdit && booking.status === 'pending' && (
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={handleConfirm}
                disabled={changeStatus.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Check size={12} /> Xác nhận
              </button>
            )}
            {canEdit && booking.status === 'confirmed' && (
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={handleComplete}
                disabled={changeStatus.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Check size={12} /> Hoàn tất
              </button>
            )}
          </>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <a
              href={`tel:${booking.customerPhone}`}
              className="action-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
            >
              <Phone size={12} /> {booking.customerPhone}
            </a>
            <a
              href={`mailto:${booking.customerEmail}`}
              className="action-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
            >
              <Mail size={12} /> {booking.customerEmail}
            </a>
          </div>

          <InfoRow icon={<FileText size={12} />} label="Dịch vụ" value={booking.service} />
          <InfoRow icon={<User size={12} />} label="Luật sư" value={booking.lawyer} />
          <InfoRow icon={<Calendar size={12} />} label="Ngày" value={formatDate(booking.date)} />
          <InfoRow
            icon={<Clock size={12} />}
            label="Giờ"
            value={`${booking.time} (${booking.durationMinutes ?? 30} phút)`}
          />
          <InfoRow
            icon={METHOD_ICONS[booking.method]}
            label="Hình thức"
            value={METHOD_LABELS[booking.method]}
          />
          {booking.notes && <InfoRow icon={<FileText size={12} />} label="Ghi chú" value={booking.notes} multiline />}
          {booking.cancelledReason && (
            <InfoRow
              icon={<X size={12} />}
              label="Lý do hủy"
              value={booking.cancelledReason}
              multiline
              variant="red"
            />
          )}
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: 12 }}>
          {(['info', 'history', 'reminder'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === k ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === k ? 'var(--primary)' : 'var(--gray-500)',
                fontSize: '0.82rem',
                fontWeight: tab === k ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {k === 'info' && 'Chi tiết'}
              {k === 'history' && 'Lịch sử'}
              {k === 'reminder' && `Reminder`}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 8 }}>
              Hành động nhanh
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {canEdit && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setConfirmCancel(true)}
                  style={{ fontSize: '0.75rem' }}
                >
                  <X size={11} /> Hủy lịch
                </button>
              )}
              {onCreateLead && !booking.leadId && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => onCreateLead(booking)}
                  style={{ fontSize: '0.75rem' }}
                >
                  <UserPlus size={11} /> Tạo Lead
                </button>
              )}
              {canEdit && booking.customerEmail && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => sendEmail.mutate(booking.id)}
                  disabled={sendEmail.isPending}
                  style={{ fontSize: '0.75rem' }}
                >
                  <SendHorizontal size={11} /> {sendEmail.isPending ? 'Đang gửi...' : 'Gửi Email'}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <HistoryTab entries={history} createdAt={booking.createdAt} updatedAt={booking.updatedAt} />
        )}

        {tab === 'reminder' && (
          <ReminderTab
            config={reminderConfig}
            isLoading={!reminderConfig}
            onToggle={handleReminderToggle}
            readonly={!canEdit}
          />
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Hủy lịch hẹn"
        message="Lý do hủy:"
        confirmLabel="Xác nhận hủy"
        variant="warning"
        isLoading={changeStatus.isPending}
      >
        <FormFieldTextarea
          label=""
          rows={2}
          placeholder="Ví dụ: Khách bận đột xuất"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xóa lịch hẹn"
        message={`Bạn có chắc muốn xóa lịch hẹn của "${booking.customerName}"?`}
        confirmLabel="Xóa"
        variant="danger"
        isLoading={remove.isPending}
      />
    </>
  );
}

function HistoryTab({
  entries,
  createdAt,
  updatedAt,
}: {
  entries: BookingHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}) {
  const typeLabels: Record<string, string> = {
    create: 'Tạo booking',
    update: 'Cập nhật',
    status_change: 'Đổi trạng thái',
    reschedule: 'Đổi lịch',
    cancel: 'Hủy booking',
    reminder_sent: 'Gửi reminder',
  };

  const typeColors: Record<string, string> = {
    create: '#059669',
    update: '#2563EB',
    status_change: '#7C3AED',
    reschedule: '#D97706',
    cancel: '#DC2626',
    reminder_sent: '#6B7280',
  };

  const allEntries: BookingHistoryEntry[] = [
    { id: '0', appointmentId: '', type: 'create', createdAt, actorName: 'Admin' },
    ...entries,
  ];

  if (allEntries.length <= 1) {
    return (
      <div style={{ padding: 12, color: 'var(--gray-400)', fontSize: '0.82rem', textAlign: 'center' }}>
        Chưa có lịch sử thay đổi
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {allEntries.map((entry, idx) => (
        <li
          key={entry.id ?? idx}
          style={{
            display: 'flex',
            gap: 10,
            padding: '8px 0',
            borderBottom: '1px solid var(--gray-100)',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: typeColors[entry.type] ?? '#6B7280',
              marginTop: 6,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)' }}>
              {typeLabels[entry.type] ?? entry.type}
            </div>
            {entry.fromValue && entry.toValue && (
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
                {entry.fromValue} → {entry.toValue}
              </div>
            )}
            {entry.reason && (
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                Lý do: {entry.reason}
              </div>
            )}
            <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 2 }}>
              {entry.actorName ?? 'Admin'} •{' '}
              {new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(entry.createdAt))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReminderTab({
  config,
  isLoading,
  onToggle,
  readonly,
}: {
  config: { reminders: ReminderConfig[] } | null | undefined;
  isLoading: boolean;
  onToggle: (type: string, enabled: boolean) => void;
  readonly: boolean;
}) {
  if (isLoading) {
    return (
      <div style={{ padding: 12, color: 'var(--gray-400)', fontSize: '0.82rem', textAlign: 'center' }}>
        Đang tải...
      </div>
    );
  }

  const presets = [
    { type: '24h', label: '24 giờ trước', description: 'Email nhắc lịch hẹn', channel: 'email' },
    { type: '2h', label: '2 giờ trước', description: 'Email nhắc lịch hẹn', channel: 'email' },
    { type: '30min', label: '30 phút trước', description: 'Email xác nhận cuối', channel: 'email' },
  ];

  const activeTypes = new Set((config?.reminders.filter((r) => r.enabled).map((r) => r.type) ?? []) as string[]);

  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 8 }}>
        Reminder sẽ tự động gửi tới khách trước giờ hẹn
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {presets.map((p) => {
          const isActive = activeTypes.has(p.type);
          return (
            <label
              key={p.type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                border: '1px solid var(--gray-200)',
                borderRadius: 8,
                cursor: readonly ? 'default' : 'pointer',
                background: isActive ? '#FFFBEB' : 'var(--white)',
                opacity: readonly && !isActive ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                disabled={readonly}
                onChange={(e) => onToggle(p.type, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{p.description}</div>
              </div>
              {isActive && <Check size={14} color="#059669" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    weekday: 'short',
  }).format(new Date(date + 'T00:00:00'));
}

function InfoRow({
  icon,
  label,
  value,
  multiline,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
  variant?: 'red';
}) {
  const labelColor = variant === 'red' ? '#DC2626' : 'var(--gray-500)';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: multiline ? '1fr' : '120px 1fr',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid var(--gray-100)',
        fontSize: '0.82rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ color: labelColor, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {icon} {label}
      </div>
      <div style={{ color: 'var(--gray-700)' }}>{value}</div>
    </div>
  );
}
