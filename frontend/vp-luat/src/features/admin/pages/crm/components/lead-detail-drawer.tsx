'use client';

import { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Drawer, ConfirmDialog } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import { LeadTimeline } from './lead-timeline';
import { LeadNotes } from './lead-notes';
import { LeadBookingsTab } from './lead-bookings-tab';
import { LeadQuickEdit } from './lead-quick-edit';
import type { Lead } from '@/lib/api/admin-crm';
import type { LeadStatus, LeadTimelineEntry, LeadNote, Booking, Lawyer } from '@/features/admin/types';
import type { LeadFormValues } from '@/features/admin/schema';
import {
  useLeadTimeline,
  useUpdateLead,
  useDeleteLead,
  useCan,
  notifyError,
  notifySuccess,
} from '@/features/admin/lib';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadApi } from '@/lib/api/admin-crm';

const STATUS_MAP: Record<LeadStatus, { label: string; variant: StatusVariant }> = {
  new: { label: 'Mới', variant: 'blue' },
  contacted: { label: 'Đã liên hệ', variant: 'yellow' },
  progress: { label: 'Đang xử lý', variant: 'purple' },
  converted: { label: 'Đã chuyển đổi', variant: 'green' },
  lost: { label: 'Mất lead', variant: 'red' },
};

type TabKey = 'info' | 'timeline' | 'notes' | 'bookings';

// Backend → frontend status mapping
const FE_STATUS: Record<string, LeadStatus> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  PROGRESS: 'progress',
  WON: 'converted',
  CONVERTED: 'converted',
  LOST: 'lost',
};

interface LeadDetailDrawerProps {
  lead: Lead | null;
  lawyers: Lawyer[];
  onClose: () => void;
  onDeleted: () => void;
}

export function LeadDetailDrawer({ lead, lawyers, onClose, onDeleted }: LeadDetailDrawerProps) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabKey>('info');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canEdit = useCan('crm.write');
  const canDelete = useCan('crm.delete');

  const { data: timelineData } = useLeadTimeline(lead?.id);

  // Map backend timeline → frontend format
  const timelineEntries: LeadTimelineEntry[] = (timelineData ?? []).map((e) => ({
    id: e.id,
    leadId: e.entityId ?? '',
    type: (e.action?.toLowerCase().includes('status') ? 'status_change' :
          e.action?.toLowerCase().includes('note') ? 'note' :
          e.action?.toLowerCase().includes('assign') ? 'assignment_change' : 'note') as LeadTimelineEntry['type'],
    content: e.summary ?? e.action ?? '',
    authorId: '',
    authorName: e.actorName ?? 'System',
    createdAt: e.createdAt?.toString() ?? new Date().toISOString(),
  }));

  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  // Status quick-change via API
  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      notifySuccess('Đã cập nhật trạng thái');
    },
    onError: (e: unknown) => notifyError('Lỗi', e instanceof Error ? e.message : 'Lỗi cập nhật'),
  });

  if (!lead) return null;

  const feStatus = FE_STATUS[lead.status?.toUpperCase() ?? ''] ?? 'new';
  const statusMeta = STATUS_MAP[feStatus] ?? STATUS_MAP.new;

  if (editing) {
    return (
      <Drawer isOpen={Boolean(lead)} onClose={() => setEditing(false)} width={520}>
        <LeadQuickEdit
          lead={lead}
          lawyers={lawyers}
          onClose={() => setEditing(false)}
          onSave={(values) => {
            const BE_STATUS: Record<string, string> = { new: 'NEW', contacted: 'CONTACTED', progress: 'PROGRESS', converted: 'CONVERTED', lost: 'LOST' };
            updateMutation.mutate({
              id: lead.id,
              patch: {
                status: BE_STATUS[values.status] ?? values.status.toUpperCase(),
                notes: values.notes,
              },
            });
          }}
          isSaving={updateMutation.isPending}
        />
      </Drawer>
    );
  }

  return (
    <>
      <Drawer
        isOpen={Boolean(lead)}
        onClose={onClose}
        width={520}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{lead.name}</span>
            <StatusBadge label={statusMeta.label} variant={statusMeta.variant} />
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
            {canEdit && (
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={() => setEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Edit3 size={12} /> Sửa
              </button>
            )}
          </>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <ContactButton href={`tel:${lead.phone ?? ''}`} label={lead.phone ?? ''} />
            <ContactButton href={`mailto:${lead.email ?? ''}`} label={lead.email ?? ''} />
          </div>
          <InfoRow label="Dịch vụ" value={lead.serviceName ?? ''} />
          <InfoRow label="Nguồn" value={lead.source ?? ''} />
          <InfoRow label="CSKH" value={lead.assignedTo?.fullName ?? ''} />
          <InfoRow
            label="Ngày tạo"
            value={lead.createdAt ? new Intl.DateTimeFormat('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }).format(new Date(lead.createdAt)) : ''}
          />
          {lead.notes && <InfoRow label="Ghi chú" value={lead.notes} multiline />}
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: 16 }}>
          {(['info', 'timeline', 'notes', 'bookings'] as TabKey[]).map((k) => (
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
              {k === 'info' && 'Thông tin'}
              {k === 'timeline' && `Hoạt động`}
              {k === 'notes' && `Ghi chú`}
              {k === 'bookings' && `Lịch hẹn`}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div>
            <InfoRow label="ID" value={<code style={{ fontSize: '0.78rem' }}>{lead.id}</code>} />
            <InfoRow
              label="Cập nhật"
              value={lead.updatedAt ? new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              }).format(new Date(lead.updatedAt)) : ''}
            />
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <StatusChangeButtons
                leadId={lead.id}
                currentStatus={feStatus}
                onChange={(s) => quickStatusMutation.mutate({ id: lead.id, status: s.toUpperCase() })}
                disabled={!canEdit}
              />
            </div>
          </div>
        )}

        {tab === 'timeline' && <LeadTimeline entries={timelineEntries} />}
        {tab === 'notes' && <LeadNotes leadId={lead.id} notes={[]} />}
        {tab === 'bookings' && <LeadBookingsTab bookings={[]} />}
      </Drawer>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate(lead.id, {
            onSuccess: () => {
              notifySuccess(`Đã xóa lead "${lead.name}"`);
              setConfirmDelete(false);
              onDeleted();
            },
          });
          setConfirmDelete(false);
        }}
        title="Xóa lead"
        message={`Bạn có chắc muốn xóa lead "${lead.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

function ContactButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="action-btn"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
    >
      {label}
    </a>
  );
}

function InfoRow({ label, value, multiline }: { label: string; value: React.ReactNode; multiline?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: multiline ? '1fr' : '120px 1fr',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid var(--gray-100)',
        fontSize: '0.82rem',
      }}
    >
      <div style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{label}</div>
      <div style={{ color: 'var(--gray-700)' }}>{value}</div>
    </div>
  );
}

function StatusChangeButtons({
  leadId,
  currentStatus,
  onChange,
  disabled,
}: {
  leadId: string;
  currentStatus: LeadStatus;
  onChange: (s: LeadStatus) => void;
  disabled?: boolean;
}) {
  const options: LeadStatus[] = ['new', 'contacted', 'progress', 'converted', 'lost'];
  return (
    <>
      {options.map((s) => (
        <button
          key={s}
          type="button"
          className={`action-btn ${currentStatus === s ? 'action-btn--primary' : ''}`}
          onClick={() => onChange(s)}
          disabled={disabled || currentStatus === s}
          style={{ fontSize: '0.75rem' }}
        >
          {STATUS_MAP[s].label}
        </button>
      ))}
    </>
  );
}
