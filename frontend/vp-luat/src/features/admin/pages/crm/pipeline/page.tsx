'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/features/admin/shared';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import { useLeads } from '../hooks/use-leads';
import { useUpdateLeadStatus } from '../hooks/use-lead-mutations';
import type { Lead } from '@/lib/api';

// Backend uses uppercase status; frontend UI used lowercase.
const UI_TO_API: Record<string, string> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  progress: 'PROGRESS',
  converted: 'CONVERTED',
  lost: 'LOST',
};
const API_TO_UI: Record<string, string> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  PROGRESS: 'progress',
  CONVERTED: 'converted',
  LOST: 'lost',
};

type UiStatus = keyof typeof API_TO_UI;

const COLUMNS: Array<{ id: UiStatus; label: string; color: string; bg: string }> = [
  { id: 'new', label: 'Mới', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'contacted', label: 'Đã liên hệ', color: '#D97706', bg: '#FFFBEB' },
  { id: 'progress', label: 'Đang xử lý', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'converted', label: 'Đã chuyển đổi', color: '#059669', bg: '#ECFDF5' },
  { id: 'lost', label: 'Mất lead', color: '#DC2626', bg: '#FEF2F2' },
];

/** Group leads by their UI-level status key. */
function groupByColumn(leads: Lead[]): Record<UiStatus, Lead[]> {
  const map: Record<UiStatus, Lead[]> = {
    new: [],
    contacted: [],
    progress: [],
    converted: [],
    lost: [],
  };
  for (const l of leads) {
    const key = (API_TO_UI[l.status] ?? 'new') as UiStatus;
    if (key in map) map[key].push(l);
  }
  return map;
}

export default function LeadPipelinePage() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading } = useLeads();
  const updateStatus = useUpdateLeadStatus();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byColumn = useMemo(() => groupByColumn(leads), [leads]);
  const activeLead = activeId ? leads.find((l) => l.id === activeId) ?? null : null;

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (e: DragEndEvent) => {
      setActiveId(null);
      if (!e.over) return;
      const leadId = String(e.active.id);
      const newUiStatus = String(e.over.id) as UiStatus;
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;

      const oldUiStatus = (API_TO_UI[lead.status] ?? 'new') as UiStatus;
      if (oldUiStatus === newUiStatus) return;

      try {
        await updateStatus(leadId, UI_TO_API[newUiStatus], UI_TO_API[oldUiStatus]);
        ghiAudit({
          action: 'status_change',
          entity: 'lead',
          entityId: leadId,
          entityLabel: lead.name,
          diff: { before: { status: oldUiStatus }, after: { status: newUiStatus } },
        });
        notifySuccess(`Đã chuyển "${lead.name}" → ${COLUMNS.find((c) => c.id === newUiStatus)?.label}`);
      } catch {
        notifyError('Lỗi', 'Không thể cập nhật trạng thái lead');
      }
    },
    [leads, updateStatus],
  );

  return (
    <div className="admin-view">
      <div style={{ marginBottom: 12 }}>
        <a
          href="/admin/crm"
          className="action-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
        >
          <ArrowLeft size={14} /> Quay lại danh sách
        </a>
      </div>

      <AdminPageHeader
        title="Lead Pipeline"
        subtitle="Kéo thả card giữa các cột để cập nhật trạng thái"
      />

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Đang tải...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))',
              gap: 12,
              overflowX: 'auto',
            }}
          >
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                column={col}
                leads={byColumn[col.id]}
                onCardClick={(id) => {
                  window.location.href = `/admin/crm?lead=${id}`;
                }}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

// ─── Column & Card (kept inline so no extra file needed) ──────────────────

import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { MoreVertical, User, Phone } from 'lucide-react';

interface ColumnProps {
  column: { id: string; label: string; color: string; bg: string };
  leads: Lead[];
  onCardClick: (id: string) => void;
}

function Column({ column, leads, onCardClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        background: column.bg,
        borderRadius: 8,
        padding: 8,
        minHeight: 400,
        border: '1.5px dashed ' + column.color + '33',
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: '0.8rem',
          color: column.color,
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {column.label}
        <span
          style={{
            background: column.color + '22',
            borderRadius: 10,
            padding: '1px 7px',
            fontSize: '0.75rem',
          }}
        >
          {leads.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {leads.map((lead) => (
          <Card key={lead.id} lead={lead} onClick={() => onCardClick(lead.id)} />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  lead: Lead;
  onClick: () => void;
}

function Card({ lead, onClick }: CardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 6,
        padding: '8px 10px',
        cursor: 'grab',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        opacity: isDragging ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 3 }}>
        {lead.name}
      </div>
      {lead.phone && (
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Phone size={10} /> {lead.phone}
        </div>
      )}
      {lead.assignedToName && (
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
          <User size={10} /> {lead.assignedToName}
        </div>
      )}
    </div>
  );
}
