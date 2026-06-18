'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, Edit3, Trash2, Check, X, Repeat, UserPlus } from 'lucide-react';
import { Drawer, ConfirmDialog, FormFieldInput, FormFieldTextarea } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import { useUpdateBooking, useChangeBookingStatus, useRescheduleBooking, useDeleteBooking } from '../hooks/use-booking-mutations';
import { ReminderList } from './booking-reminder-config';
import { useCan } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import { notifySuccess, ghiAudit } from '@/features/admin/lib';
import type { Booking, BookingStatus, Lead } from '@/features/admin/types';

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
  onReschedule?: (b: Booking) => void;
  onCreateLead?: (b: Booking) => void;
}

export function BookingDetailDrawer({ booking, onClose, onDeleted, onCreateLead }: BookingDetailDrawerProps) {
  const canEdit = useCan('booking.write');
  const canDelete = useCan('booking.delete');

  const update = useUpdateBooking();
  const changeStatus = useChangeBookingStatus();
  const reschedule = useRescheduleBooking();
  const remove = useDeleteBooking();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<'info' | 'history' | 'reminder'>('info');

  if (!booking) return null;

  const status = STATUS_MAP[booking.status];

  const handleConfirm = () => {
    changeStatus.mutate({ id: booking.id, status: 'confirmed' });
  };
  const handleComplete = () => {
    changeStatus.mutate({ id: booking.id, status: 'completed' });
  };
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
                <Trash2 size={12} /> Xóa
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
            <a href={`tel:${booking.customerPhone}`} className="action-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
              <Phone size={12} /> {booking.customerPhone}
            </a>
            <a href={`mailto:${booking.customerEmail}`} className="action-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
              <Mail size={12} /> {booking.customerEmail}
            </a>
          </div>

          <InfoRow icon={<FileText size={12} />} label="Dịch vụ" value={booking.service} />
          <InfoRow icon={<User size={12} />} label="Luật sư" value={booking.lawyer} />
          <InfoRow icon={<Calendar size={12} />} label="Ngày" value={formatDate(booking.date)} />
          <InfoRow icon={<Clock size={12} />} label="Giờ" value={`${booking.time} (${booking.durationMinutes ?? 30} phút)`} />
          <InfoRow icon={METHOD_ICONS[booking.method]} label="Hình thức" value={METHOD_LABELS[booking.method]} />
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
              {k === 'reminder' && `Reminder (${booking.reminders?.length ?? 0})`}
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
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
            <p>Booking được tạo: {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(booking.createdAt))}</p>
            <p>Cập nhật: {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(booking.updatedAt))}</p>
          </div>
        )}

        {tab === 'reminder' && <ReminderList reminders={booking.reminders ?? []} />}
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
