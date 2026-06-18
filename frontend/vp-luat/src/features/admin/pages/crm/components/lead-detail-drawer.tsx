'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit3, Trash2 } from 'lucide-react';
import { Drawer, ConfirmDialog } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import { LeadTimeline } from './lead-timeline';
import { LeadNotes } from './lead-notes';
import { LeadBookingsTab } from './lead-bookings-tab';
import { LeadQuickEdit } from './lead-quick-edit';
import { MockDB } from '@/features/admin/mock/db';
import {
  notifyError,
  notifySuccess,
  ghiAudit,
  useCan,
  useMockQuery,
} from '@/features/admin/lib';
import type {
  Lead,
  LeadStatus,
  LeadTimelineEntry,
  LeadNote,
  Booking,
  Lawyer,
} from '@/features/admin/types';

const STATUS_MAP: Record<LeadStatus, { label: string; variant: StatusVariant }> = {
  new: { label: 'Mới', variant: 'blue' },
  contacted: { label: 'Đã liên hệ', variant: 'yellow' },
  progress: { label: 'Đang xử lý', variant: 'purple' },
  converted: { label: 'Đã chuyển đổi', variant: 'green' },
  lost: { label: 'Mất lead', variant: 'red' },
};

type TabKey = 'info' | 'timeline' | 'notes' | 'bookings';

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

  const { data: timeline = [] } = useMockQuery<LeadTimelineEntry>(
    'lead_timeline',
    lead ? (r) => r.leadId === lead.id : undefined,
  );
  const { data: notes = [] } = useMockQuery<LeadNote>(
    'lead_notes',
    lead ? (r) => r.leadId === lead.id : undefined,
  );
  const { data: bookings = [] } = useMockQuery<Booking>(
    'bookings',
    lead ? (r) => r.leadId === lead.id : undefined,
  );

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Lead>) => {
      if (!lead) throw new Error('No lead');
      const before = MockDB.getById<Lead>('leads', lead.id);
      const updated = MockDB.update<Lead>('leads', lead.id, patch);
      if (before && patch.status && before.status !== patch.status) {
        ghiAudit({
          action: 'status_change',
          entity: 'lead',
          entityId: lead.id,
          entityLabel: updated?.name,
          diff: { before: { status: before.status }, after: { status: patch.status } },
        });
        MockDB.insert<LeadTimelineEntry>('lead_timeline', {
          id: `tl-${Date.now()}`,
          leadId: lead.id,
          type: 'status_change',
          content: `Trạng thái: ${before.status} → ${patch.status}`,
          authorId: 'system',
          authorName: 'System',
          createdAt: new Date().toISOString(),
        });
      } else {
        ghiAudit({ action: 'update', entity: 'lead', entityId: lead.id, entityLabel: updated?.name });
        MockDB.insert<LeadTimelineEntry>('lead_timeline', {
          id: `tl-${Date.now()}`,
          leadId: lead.id,
          type: 'note',
          content: 'Cập nhật thông tin lead',
          authorId: 'system',
          authorName: 'System',
          createdAt: new Date().toISOString(),
        });
      }
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
      qc.invalidateQueries({ queryKey: ['admin', 'lead_timeline'] });
      notifySuccess('Đã cập nhật lead');
      setEditing(false);
    },
    onError: (e: unknown) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!lead) return;
      MockDB.delete('leads', lead.id);
      ghiAudit({ action: 'delete', entity: 'lead', entityId: lead.id, entityLabel: lead.name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
      notifySuccess('Đã xóa lead');
      onDeleted();
    },
  });

  if (!lead) return null;

  const status = STATUS_MAP[lead.status];

  if (editing) {
    return (
      <Drawer isOpen={Boolean(lead)} onClose={() => setEditing(false)} width={520}>
        <LeadQuickEdit
          lead={lead}
          lawyers={lawyers}
          onClose={() => setEditing(false)}
          onSave={(v) => updateMutation.mutate(v)}
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
            <ContactButton href={`tel:${lead.phone}`} label={lead.phone} />
            <ContactButton href={`mailto:${lead.email}`} label={lead.email} />
          </div>
          <InfoRow label="Dịch vụ" value={lead.service} />
          <InfoRow label="Nguồn" value={lead.source} />
          <InfoRow label="CSKH" value={lead.assignedTo} />
          <InfoRow
            label="Ngày tạo"
            value={new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(lead.createdAt))}
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
              {k === 'timeline' && `Hoạt động (${timeline.length})`}
              {k === 'notes' && `Ghi chú (${notes.length})`}
              {k === 'bookings' && `Lịch hẹn (${bookings.length})`}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div>
            <InfoRow label="ID" value={<code style={{ fontSize: '0.78rem' }}>{lead.id}</code>} />
            <InfoRow
              label="Cập nhật"
              value={new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(lead.updatedAt))}
            />
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <StatusChangeButtons lead={lead} onChange={(s) => updateMutation.mutate({ status: s })} disabled={!canEdit} />
            </div>
          </div>
        )}

        {tab === 'timeline' && <LeadTimeline entries={timeline} />}
        {tab === 'notes' && <LeadNotes leadId={lead.id} notes={notes} />}
        {tab === 'bookings' && <LeadBookingsTab bookings={bookings} />}
      </Drawer>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate();
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
  lead,
  onChange,
  disabled,
}: {
  lead: Lead;
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
          className={`action-btn ${lead.status === s ? 'action-btn--primary' : ''}`}
          onClick={() => onChange(s)}
          disabled={disabled || lead.status === s}
          style={{ fontSize: '0.75rem' }}
        >
          {STATUS_MAP[s].label}
        </button>
      ))}
    </>
  );
}
