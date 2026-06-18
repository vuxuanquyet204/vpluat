'use client';

import { useMemo, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Download, Users, LayoutGrid } from 'lucide-react';
import { AdminPageHeader, FilterTabs, SearchBar } from '@/features/admin/shared';
import { ConfirmDialog } from '@/features/admin/components';
import { LeadsTable } from './components/leads-table';
import { LeadForm } from './components/lead-form';
import { LeadDetailDrawer } from './components/lead-detail-drawer';
import { LeadFilters, type LeadFiltersValue } from './components/lead-filters';
import { LeadSourceChart } from './components/lead-source-chart';
import { LeadStats } from './components/lead-timeline';
import {
  useMockQuery,
  useUpdate,
  useDelete,
  useDeleteMany,
  useCan,
  exportToCSV,
  notifySuccess,
  notifyError,
} from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import { notifyLeadCreated } from '@/features/admin/pages/notifications/lib/notification-bridge';
import type { Lead, Lawyer, LeadStatus, LeadSource } from '@/features/admin/types';

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

  // Data
  const { data: allLeads = [], isLoading } = useMockQuery<Lead>('leads');
  const { data: lawyers = [] } = useMockQuery<Lawyer>('lawyers');

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState<LeadFiltersValue>({
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Form / Drawer
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);

  // Counts per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allLeads.length };
    for (const s of ['new', 'contacted', 'progress', 'converted', 'lost']) {
      counts[s] = allLeads.filter((l) => l.status === s).length;
    }
    return counts;
  }, [allLeads]);

  const tabsWithCounts = STATUS_TABS.map((t) => ({ ...t, count: statusCounts[t.value] ?? 0 }));

  // Filter
  const filtered = useMemo(() => {
    let result = allLeads;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (advancedFilters.source !== 'all') {
      result = result.filter((l) => l.source === advancedFilters.source);
    }
    if (advancedFilters.assignedTo !== 'all') {
      result = result.filter((l) => l.assignedTo === advancedFilters.assignedTo);
    }
    if (advancedFilters.dateFrom) {
      const from = new Date(advancedFilters.dateFrom).getTime();
      result = result.filter((l) => new Date(l.createdAt).getTime() >= from);
    }
    if (advancedFilters.dateTo) {
      const to = new Date(advancedFilters.dateTo).getTime() + 24 * 60 * 60 * 1000;
      result = result.filter((l) => new Date(l.createdAt).getTime() <= to);
    }
    return result;
  }, [allLeads, search, statusFilter, advancedFilters]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    allLeads.forEach((l) => set.add(l.assignedTo));
    return Array.from(set);
  }, [allLeads]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: allLeads.length,
      newCount: statusCounts.new ?? 0,
      contactedCount: (statusCounts.contacted ?? 0) + (statusCounts.progress ?? 0),
      convertedCount: statusCounts.converted ?? 0,
      lostCount: statusCounts.lost ?? 0,
    };
  }, [allLeads, statusCounts]);

  // Source distribution
  const sourceCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of allLeads) map[l.source] = (map[l.source] ?? 0) + 1;
    return map;
  }, [allLeads]);

  // Mutations
  const updateMutation = useUpdate<Lead>('leads', 'lead');
  const deleteMutation = useDelete('leads', 'lead');
  const deleteManyMutation = useDeleteMany('leads', 'lead');

  const handleSubmitForm = useCallback(
    async (values: import('@/features/admin/schema').LeadFormValues) => {
      try {
        if (editingLead) {
          await updateMutation.mutateAsync({ id: editingLead.id, patch: values });
          notifySuccess('Đã cập nhật lead');
        } else {
          const newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
            name: values.name,
            phone: values.phone,
            email: values.email,
            service: values.service,
            source: values.source,
            status: values.status,
            assignedTo: values.assignedTo,
            notes: values.notes,
          };
          MockDB.insert<Lead>('leads', newLead as Lead);
          // Ghi timeline
          const created = MockDB.getAll<Lead>('leads').slice(-1)[0];
          if (created) {
            MockDB.insert('lead_timeline', {
              id: `tl-${Date.now()}`,
              leadId: created.id,
              type: 'note',
              content: 'Lead mới được tạo',
              authorId: 'system',
              authorName: 'System',
              createdAt: new Date().toISOString(),
            });
          }
          qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
          qc.invalidateQueries({ queryKey: ['admin', 'lead_timeline'] });
          notifySuccess('Đã tạo lead mới');
          // NC-04: auto-generate notification
          notifyLeadCreated(values.name, values.source, created?.id ?? '');
        }
        setFormOpen(false);
        setEditingLead(null);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu lead');
      }
    },
    [editingLead, updateMutation, qc],
  );

  const handleBulkStatusChange = useCallback(
    async (selected: Lead[], status: LeadStatus) => {
      try {
        for (const l of selected) {
          await updateMutation.mutateAsync({ id: l.id, patch: { status } });
        }
        notifySuccess(`Đã đổi trạng thái ${selected.length} lead → ${status}`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
      }
    },
    [updateMutation],
  );

  const handleBulkAssign = useCallback(
    async (selected: Lead[], assignee: string) => {
      try {
        for (const l of selected) {
          await updateMutation.mutateAsync({ id: l.id, patch: { assignedTo: assignee } });
        }
        notifySuccess(`Đã gán ${selected.length} lead cho ${assignee}`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể gán');
      }
    },
    [updateMutation],
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

  const handleExport = useCallback(() => {
    exportToCSV(
      filtered as unknown as Record<string, unknown>[],
      `leads-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'name', header: 'Họ tên' },
        { key: 'phone', header: 'SĐT' },
        { key: 'email', header: 'Email' },
        { key: 'service', header: 'Dịch vụ' },
        { key: 'source', header: 'Nguồn' },
        { key: 'status', header: 'Trạng thái' },
        { key: 'assignedTo', header: 'CSKH' },
        { key: 'createdAt', header: 'Ngày tạo' },
      ],
    );
    notifySuccess(`Đã export ${filtered.length} lead ra CSV`);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Quản lý Lead / CRM"
        subtitle={`Theo dõi và chăm sóc ${allLeads.length} khách hàng tiềm năng`}
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
              disabled={filtered.length === 0}
            >
              <Download size={14} /> Export CSV
            </button>
            {canCreate && (
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={() => {
                  setEditingLead(null);
                  setFormOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Thêm Lead
              </button>
            )}
          </div>
        }
      />

      {/* Stats mini */}
      <LeadStats {...stats} />

      {/* Chart: source distribution */}
      <div className="admin-card" style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="admin-card__header">
          <div className="admin-card__title">Phân bổ Lead theo nguồn</div>
        </div>
        <LeadSourceChart sourceCounts={sourceCounts} />
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên, SĐT, email..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Tổng: {filtered.length} / {allLeads.length}
          </span>
        </div>

        <FilterTabs
          tabs={tabsWithCounts}
          activeValue={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />

        <LeadFilters value={advancedFilters} onChange={setAdvancedFilters} assignees={assignees} />

        <LeadsTable
          data={paginated}
          isLoading={isLoading}
          onRowClick={(l) => setDetailLead(l)}
          onEdit={(l) => {
            setEditingLead(l);
            setFormOpen(true);
          }}
          onDelete={(l) => setConfirmDelete(l)}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkAssign={handleBulkAssign}
          onBulkDelete={(rows) => canDelete && handleBulkDelete(rows)}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: '0.82rem', color: 'var(--gray-500)' }}>
            <span>
              Trang {page} / {totalPages} · {filtered.length} kết quả
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" className="action-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                ‹ Trước
              </button>
              <button type="button" className="action-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Sau ›
              </button>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <LeadForm
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingLead(null);
          }}
          onSubmit={handleSubmitForm}
          initial={editingLead}
          lawyers={lawyers}
          isLoading={updateMutation.isPending}
        />
      )}

      <LeadDetailDrawer
        lead={detailLead}
        lawyers={lawyers}
        onClose={() => setDetailLead(null)}
        onDeleted={() => setDetailLead(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteMutation.mutate(confirmDelete.id, {
              onSuccess: () => notifySuccess(`Đã xóa lead "${confirmDelete.name}"`),
            });
            setConfirmDelete(null);
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
