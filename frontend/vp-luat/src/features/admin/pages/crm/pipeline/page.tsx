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
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { ArrowLeft, MoreVertical, User, Phone } from 'lucide-react';
import { AdminPageHeader } from '@/features/admin/shared';
import {
  useMockQuery,
  useUpdate,
  notifySuccess,
  notifyError,
  ghiAudit,
} from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type { Lead, LeadStatus, LeadTimelineEntry } from '@/features/admin/types';

const COLUMNS: Array<{ id: LeadStatus; label: string; color: string; bg: string }> = [
  { id: 'new', label: 'Mới', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'contacted', label: 'Đã liên hệ', color: '#D97706', bg: '#FFFBEB' },
  { id: 'progress', label: 'Đang xử lý', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'converted', label: 'Đã chuyển đổi', color: '#059669', bg: '#ECFDF5' },
  { id: 'lost', label: 'Mất lead', color: '#DC2626', bg: '#FEF2F2' },
];

export default function LeadPipelinePage() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading } = useMockQuery<Lead>('leads');
  const updateMutation = useUpdate<Lead>('leads', 'lead');
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byColumn = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = { new: [], contacted: [], progress: [], converted: [], lost: [] };
    for (const l of leads) map[l.status].push(l);
    return map;
  }, [leads]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (e: DragEndEvent) => {
      setActiveId(null);
      if (!e.over) return;
      const leadId = String(e.active.id);
      const newStatus = String(e.over.id) as LeadStatus;
      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.status === newStatus) return;

      const before = lead.status;
      // Optimistic: write directly then notify
      const beforeStatus = before;
      MockDB.update<Lead>('leads', leadId, { status: newStatus });
      // Timeline entry
      MockDB.insert<LeadTimelineEntry>('lead_timeline', {
        id: `tl-${Date.now()}`,
        leadId,
        type: 'status_change',
        content: `Trạng thái: ${beforeStatus} → ${newStatus}`,
        authorId: 'system',
        authorName: 'System',
        createdAt: new Date().toISOString(),
      });
      ghiAudit({
        action: 'status_change',
        entity: 'lead',
        entityId: leadId,
        entityLabel: lead.name,
        diff: { before: { status: beforeStatus }, after: { status: newStatus } },
      });
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
      qc.invalidateQueries({ queryKey: ['admin', 'lead_timeline'] });
      notifySuccess(`Đã chuyển "${lead.name}" → ${COLUMNS.find((c) => c.id === newStatus)?.label}`);
    },
    [leads, qc],
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
          <DragOverlay dropAnimation={null}>
            {activeLead ? <KanbanCard lead={activeLead} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function Column({
  column,
  leads,
  onCardClick,
}: {
  column: { id: LeadStatus; label: string; color: string; bg: string };
  leads: Lead[];
  onCardClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? column.bg : 'var(--gray-50)',
        border: isOver ? `2px dashed ${column.color}` : '2px solid transparent',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 12,
        minHeight: 400,
        transition: 'background 0.15s, border 0.15s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: column.color,
            }}
          />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-700)' }}>
            {column.label}
          </span>
        </div>
        <span
          style={{
            padding: '2px 8px',
            background: column.bg,
            color: column.color,
            borderRadius: 999,
            fontSize: '0.7rem',
            fontWeight: 700,
          }}
        >
          {leads.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leads.map((l) => (
          <DraggableCard key={l.id} lead={l} onClick={() => onCardClick(l.id)} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (isDragging) return;
        e.stopPropagation();
        onClick();
      }}
    >
      <KanbanCard lead={lead} isDragging={isDragging} />
    </div>
  );
}

function KanbanCard({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: '10px 12px',
        cursor: 'grab',
        boxShadow: isDragging ? '0 10px 25px rgb(15 23 42 / 0.18)' : '0 1px 2px rgb(15 23 42 / 0.04)',
        opacity: isDragging ? 0.85 : 1,
        transform: isDragging ? 'rotate(2deg)' : undefined,
      }}
    >
      <div
        style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--primary)',
          marginBottom: 4,
        }}
      >
        {lead.name}
      </div>
      <div
        style={{
          fontSize: '0.72rem',
          color: 'var(--gray-500)',
          marginBottom: 6,
        }}
      >
        {lead.service}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: 'var(--gray-400)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <User size={10} /> {lead.assignedTo}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Phone size={10} /> {lead.phone.slice(-4)}
        </span>
      </div>
    </div>
  );
}
