'use client';

import { useMemo, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Download, LayoutGrid } from 'lucide-react';
import { AdminPageHeader, FilterTabs, SearchBar } from '@/features/admin/shared';
import { ConfirmDialog } from '@/features/admin/components';
import { LeadsTable } from './components/leads-table';
import { LeadForm } from './components/lead-form';
import { LeadDetailDrawer } from './components/lead-detail-drawer';
import { LeadFilters, type LeadFiltersValue } from './components/lead-filters';
import { LeadSourceChart } from './components/lead-source-chart';
import { LeadStats } from './components/lead-timeline';
import {
  useLeads,
  useLeadStats,
  useLeadSourceCounts,
  useUpdateLead,
  useDeleteLead,
  useDeleteManyLeads,
  useBulkUpdateStatus,
  useBulkAssign,
  useBulkAssignByName,
  useCan,
  notifySuccess,
  notifyError,
  exportToCSV,
} from '@/features/admin/lib';
import type { Lead } from '@/lib/api/admin-crm';
import type { LeadStatus } from '@/features/admin/types';

const LIMIT = 20;

// Backend uses UPPERCASE, frontend uses lowercase
// Backend: NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST, DUPLICATE
const BE_STATUS: Record<string, string> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  progress: 'NEGOTIATION',
  converted: 'WON',
  lost: 'LOST',
};
const FE_STATUS: Record<string, LeadStatus> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'progress',
  PROPOSAL: 'progress',
  NEGOTIATION: 'progress',
  WON: 'converted',
  LOST: 'lost',
  DUPLICATE: 'lost',
};

// Normalise a backend Lead → Lead (compatible with LeadsTable props)
function normalise(l: Lead) {
  return {
    id: l.id,
    name: l.name,
    phone: l.phone ?? '',
    email: l.email ?? '',
    serviceName: l.serviceName ?? '',
    source: l.source ?? 'other',
    status: l.status ?? 'NEW',
    assignedTo: l.assignedTo,
    notes: l.notes,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả', count: 0 },
  { value: 'new', label: 'Mới', count: 0 },
  { value: 'contacted', label: 'Đã liên hệ', count: 0 },
  { value: 'progress', label: 'Đang xử lý', count: 0 },
  { value: 'converted', label: 'Đã chuyển đổi', count: 0 },
  { value: 'lost', label: 'Mất lead', count: 0 },
];

export default function CRMPage() {
  const qc = useQueryClient();
  const canCreate = useCan('crm.write');
  const canDelete = useCan('crm.delete');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState<LeadFiltersValue>({
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(0);

  const backendParams = useMemo(() => ({
    page,
    size: LIMIT,
    status: statusFilter !== 'all' ? BE_STATUS[statusFilter] : undefined,
    source: advancedFilters.source !== 'all' ? advancedFilters.source.toUpperCase() : undefined,
    search: search || undefined,
  }), [page, statusFilter, advancedFilters, search]);

  const { data: pageData, isLoading } = useLeads(backendParams);
  const entries: Lead[] = pageData?.content ?? [];
  const total = pageData?.totalElements ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const { stats } = useLeadStats({ ...backendParams, size: LIMIT, page: 0 });
  const sourceCounts = useLeadSourceCounts(advancedFilters);

  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();
  const deleteManyMutation = useDeleteManyLeads();
  const bulkStatusMutation = useBulkUpdateStatus();
  const bulkAssignMutation = useBulkAssignByName();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);

  const tabsWithCounts = STATUS_TABS.map((t) => ({
    ...t,
    count: t.value === 'all' ? stats.total : (stats[t.value as keyof typeof stats] ?? 0),
  }));

  const assignees = useMemo(() => {
    const set = new Set<string>();
    for (const l of entries) {
      if (l.assignedTo?.fullName) set.add(l.assignedTo.fullName);
    }
    return Array.from(set);
  }, [entries]);

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmitForm = useCallback(
    async (values: import('@/features/admin/schema').LeadFormValues) => {
      try {
        if (editingLead) {
          await updateMutation.mutateAsync({
            id: editingLead.id,
            patch: {
              status: BE_STATUS[values.status],
              notes: values.notes,
            },
          });
          notifySuccess('Đã cập nhật lead');
        }
        setFormOpen(false);
        setEditingLead(null);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu lead');
      }
    },
    [editingLead, updateMutation],
  );

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const handleBulkStatusChange = useCallback(
    async (selected: Lead[], status: LeadStatus) => {
      try {
        await bulkStatusMutation.mutateAsync({
          ids: selected.map((l) => l.id),
          status: BE_STATUS[status] ?? status,
        });
        notifySuccess(`Đã đổi trạng thái ${selected.length} lead → ${status}`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
      }
    },
    [bulkStatusMutation],
  );

  const handleBulkAssign = useCallback(
    async (selected: Lead[], assigneeName: string) => {
      try {
        await bulkAssignMutation.mutateAsync({
          ids: selected.map((l) => l.id),
          assigneeName,
        });
        notifySuccess(`Đã gán ${selected.length} lead cho ${assigneeName}`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể gán');
      }
    },
    [bulkAssignMutation],
  );

  const handleBulkDelete = useCallback(
    (selected: Lead[]) => {
      deleteManyMutation.mutate(selected.map((l) => l.id), {
        onSuccess: () => notifySuccess(`Đã xóa ${selected.length} lead`),
        onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa'),
      });
    },
    [deleteManyMutation],
  );

  // ── Export ─────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const rows = entries.map((l) => ({
      name: l.name,
      phone: l.phone ?? '',
      email: l.email ?? '',
      service: l.serviceName ?? '',
      source: l.source ?? '',
      status: l.status ?? '',
      assignedTo: l.assignedTo?.fullName ?? '',
      createdAt: l.createdAt,
    }));
    exportToCSV(rows as unknown as Record<string, unknown>[], `leads-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'name', header: 'Họ tên' },
      { key: 'phone', header: 'SĐT' },
      { key: 'email', header: 'Email' },
      { key: 'service', header: 'Dịch vụ' },
      { key: 'source', header: 'Nguồn' },
      { key: 'status', header: 'Trạng thái' },
      { key: 'assignedTo', header: 'CSKH' },
      { key: 'createdAt', header: 'Ngày tạo' },
    ]);
    notifySuccess(`Đã export ${entries.length} lead ra CSV`);
  }, [entries]);

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Quản lý Lead / CRM"
        subtitle={`Theo dõi và chăm sóc ${stats.total} khách hàng tiềm năng`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href="/admin/crm/pipeline"
              className="action-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
            >
              <LayoutGrid size={14} /> Kanban
            </a>
            <button
              type="button"
              className="action-btn"
              onClick={handleExport}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              disabled={entries.length === 0}
            >
              <Download size={14} /> Export CSV
            </button>
            {canCreate && (
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={() => { setEditingLead(null); setFormOpen(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Thêm Lead
              </button>
            )}
          </div>
        }
      />

      <LeadStats {...stats} />

      <div className="admin-card" style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="admin-card__header">
          <div className="admin-card__title">Phân bổ Lead theo nguồn</div>
        </div>
        <LeadSourceChart sourceCounts={sourceCounts} />
      </div>

      <div className="admin-card">
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(0); }}
            placeholder="Tìm theo tên, SĐT, email..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Tổng: {total}
          </span>
        </div>

        <FilterTabs
          tabs={tabsWithCounts}
          activeValue={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(0); }}
        />

        <LeadFilters
          value={advancedFilters}
          onChange={(v) => { setAdvancedFilters(v); setPage(0); }}
          assignees={assignees}
        />

        <LeadsTable
          data={entries}
          isLoading={isLoading}
          onRowClick={(l) => setDetailLead(l)}
          onEdit={(l) => { setEditingLead(l); setFormOpen(true); }}
          onDelete={(l) => setConfirmDelete(l)}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkAssign={handleBulkAssign}
          onBulkDelete={(rows) => canDelete && handleBulkDelete(rows)}
        />

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: '0.82rem', color: 'var(--gray-500)' }}>
            <span>
              Trang {page + 1} / {totalPages} · {total} kết quả
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className="action-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ‹ Trước
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Sau ›
              </button>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <LeadForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditingLead(null); }}
          onSubmit={handleSubmitForm}
          initial={editingLead}
          lawyers={[]}
          isLoading={updateMutation.isPending}
        />
      )}

      <LeadDetailDrawer
        lead={detailLead}
        lawyers={[]}
        onClose={() => setDetailLead(null)}
        onDeleted={() => setDetailLead(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteMutation.mutate(confirmDelete.id, {
              onSuccess: () => {
                notifySuccess(`Đã xóa lead "${confirmDelete.name}"`);
                setConfirmDelete(null);
              },
            });
          }
        }}
        title="Xóa lead"
        message={`Bạn có chắc muốn xóa lead "${confirmDelete?.name}"?`}
        confirmLabel="Xóa"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
