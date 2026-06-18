'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Download,
  Briefcase,
  Users,
  Grid3x3,
  CalendarDays,
  FileText,
} from 'lucide-react';
import {
  AdminPageHeader,
  FilterTabs,
  SearchBar,
  Pagination,
  ConfirmDialog,
} from '@/features/admin/shared';
import {
  useMockQuery,
  useCreate,
  useUpdate,
  useDelete,
  useDeleteMany,
  useCan,
  notifySuccess,
  notifyError,
  exportToCSV,
} from '@/features/admin/lib';
import { ServiceForm } from './components/service-form';
import { LawyerForm } from './components/lawyer-form';
import { ServicesTable } from './components/services-table';
import { LawyersTable } from './components/lawyers-table';
import { ServiceFilters, type ServiceFiltersValue } from './components/services-filters';
import { AssignmentMatrix } from './components/assignment-matrix';
import { LawyerScheduleEditor } from './components/lawyer-schedule-editor';
import { useServices } from './hooks/use-services';
import { useLawyers } from './hooks/use-lawyers';
import { useAssignment } from './hooks/use-assignment';
import type {
  Service,
  Lawyer,
} from '@/features/admin/types';
import type { ServiceFormValues, LawyerFormValues } from '@/features/admin/schema';

type Tab = 'services' | 'lawyers' | 'assignment' | 'schedule';

const TAB_LIST: Array<{ value: Tab; label: string; icon: typeof Briefcase }> = [
  { value: 'services', label: 'Dịch vụ', icon: Briefcase },
  { value: 'lawyers', label: 'Luật sư', icon: Users },
  { value: 'assignment', label: 'Phân công', icon: Grid3x3 },
  { value: 'schedule', label: 'Lịch làm việc', icon: CalendarDays },
];

const SERVICE_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
] as const;

const LAWYER_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
] as const;

export default function ServicesPage() {
  const [tab, setTab] = useState<Tab>('services');

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Dịch vụ & Luật sư"
        subtitle="Quản lý dịch vụ pháp lý, đội ngũ luật sư, phân công và lịch làm việc"
      />

      <div className="filter-bar" role="tablist" style={{ marginBottom: 16 }}>
        {TAB_LIST.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className={`filter-tab ${tab === t.value ? 'filter-tab--active' : ''}`}
              onClick={() => setTab(t.value)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon size={12} />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {tab === 'services' && <ServicesTab />}
      {tab === 'lawyers' && <LawyersTab />}
      {tab === 'assignment' && <AssignmentTab />}
      {tab === 'schedule' && <ScheduleTab />}
    </div>
  );
}

// ─── Tab 1: Services ─────────────────────────────────────────────────────
function ServicesTab() {
  const { data: services, counts } = useServices();
  const { data: lawyers = [] } = useLawyers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [filters, setFilters] = useState<ServiceFiltersValue>({
    category: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const LIMIT = 20;

  const canWrite = useCan('services.write');
  const canDelete = useCan('services.write');

  const createSvc = useCreate<Service>('services', 'service');
  const updateSvc = useUpdate<Service>('services', 'service');
  const removeSvc = useDelete('services', 'service');
  const removeManySvc = useDeleteMany('services', 'service');

  const tabsWithCounts = SERVICE_TABS.map((t) => ({
    value: t.value,
    label: t.label,
    count:
      t.value === 'all'
        ? counts.total
        : t.value === 'active'
          ? counts.active
          : counts.inactive,
  }));

  const filtered = useMemo(() => {
    let r = services;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      const wantActive = statusFilter === 'active';
      r = r.filter((s) => s.isActive === wantActive);
    }
    if (filters.category !== 'all') r = r.filter((s) => s.category === filters.category);
    if (filters.status !== 'all') {
      const wantActive = filters.status === 'active';
      r = r.filter((s) => s.isActive === wantActive);
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      r = r.filter((s) => new Date(s.createdAt).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 24 * 60 * 60 * 1000;
      r = r.filter((s) => new Date(s.createdAt).getTime() <= to);
    }
    return r;
  }, [services, search, statusFilter, filters]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSubmit = async (values: ServiceFormValues) => {
    const payload: Omit<Service, 'id' | 'createdAt'> = {
      name: values.name,
      description: values.description ?? '',
      category: values.category,
      price: values.price,
      duration: values.duration,
      isActive: values.isActive,
      lawyerIds: values.lawyerIds,
    };
    try {
      if (editing) {
        await updateSvc.mutateAsync({ id: editing.id, patch: payload });
        notifySuccess('Đã cập nhật dịch vụ');
      } else {
        await createSvc.mutateAsync(payload);
        notifySuccess('Đã tạo dịch vụ');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
    }
  };

  const handleToggleActive = useCallback(
    async (s: Service) => {
      try {
        await updateSvc.mutateAsync({
          id: s.id,
          patch: { isActive: !s.isActive },
        });
        notifySuccess(s.isActive ? `Đã tạm dừng "${s.name}"` : `Đã kích hoạt "${s.name}"`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
      }
    },
    [updateSvc],
  );

  const handleExport = () => {
    exportToCSV(
      filtered as unknown as Record<string, unknown>[],
      `services-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'name', header: 'Tên dịch vụ' },
        { key: 'category', header: 'Danh mục' },
        { key: 'price', header: 'Giá' },
        { key: 'duration', header: 'Thời gian' },
        { key: 'isActive', header: 'Trạng thái' },
      ],
    );
    notifySuccess(`Đã export ${filtered.length} dịch vụ`);
  };

  return (
    <>
      <AdminPageHeader
        title="Danh sách dịch vụ"
        subtitle={`${counts.total} dịch vụ · ${counts.active} hoạt động · ${counts.inactive} tạm dừng`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="action-btn"
              onClick={handleExport}
              disabled={filtered.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Download size={14} /> Export CSV
            </button>
            {canWrite && (
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Tạo dịch vụ
              </button>
            )}
          </div>
        }
      />

      {selectedIds.length > 0 && canDelete && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--gray-900)',
            color: 'white',
            borderRadius: 'var(--radius-md, 6px)',
            marginBottom: 12,
            fontSize: '0.8rem',
          }}
        >
          <span>Đã chọn {selectedIds.length} dịch vụ</span>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="action-btn"
            style={{ background: '#DC2626', color: 'white', borderColor: '#DC2626' }}
            onClick={() => setConfirmBulkDelete(true)}
          >
            Xóa
          </button>
          <button
            type="button"
            className="action-btn"
            style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => setSelectedIds([])}
          >
            Hủy
          </button>
        </div>
      )}

      <FilterTabs
        tabs={tabsWithCounts}
        activeValue={statusFilter}
        onChange={(v) => {
          setStatusFilter(v as typeof statusFilter);
          setPage(1);
        }}
      />

      <div className="admin-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên dịch vụ, mô tả, danh mục..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Tổng: {filtered.length} / {services.length}
          </span>
        </div>

        <ServiceFilters
          value={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />

        <ServicesTable
          data={paginated}
          lawyers={lawyers}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={(s) => {
            setEditing(s);
            setFormOpen(true);
          }}
          onDelete={(s) => setConfirmDelete(s)}
          onToggleActive={handleToggleActive}
          canWrite={canWrite}
          canDelete={canDelete}
        />

        <Pagination
          page={page}
          limit={LIMIT}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <ServiceForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        lawyers={lawyers}
        isLoading={createSvc.isPending || updateSvc.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa dịch vụ"
        message={
          confirmDelete
            ? `Bạn có chắc muốn xóa "${confirmDelete.name}"? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removeSvc.mutateAsync(confirmDelete.id);
            notifySuccess('Đã xóa dịch vụ');
          } catch (e) {
            notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
          } finally {
            setConfirmDelete(null);
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title="Xóa nhiều dịch vụ"
        message={`Bạn có chắc muốn xóa ${selectedIds.length} dịch vụ đã chọn?`}
        confirmLabel="Xóa tất cả"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          try {
            await removeManySvc.mutateAsync(selectedIds);
            notifySuccess(`Đã xóa ${selectedIds.length} dịch vụ`);
            setSelectedIds([]);
          } catch (e) {
            notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
          } finally {
            setConfirmBulkDelete(false);
          }
        }}
        onClose={() => setConfirmBulkDelete(false)}
      />
    </>
  );
}

// ─── Tab 2: Lawyers ──────────────────────────────────────────────────────
function LawyersTab() {
  const { data: lawyers, counts } = useLawyers();
  const { data: services = [] } = useServices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lawyer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lawyer | null>(null);
  const LIMIT = 20;

  const canWrite = useCan('lawyers.write');
  const canDelete = useCan('lawyers.write');

  const createLwy = useCreate<Lawyer>('lawyers', 'lawyer');
  const updateLwy = useUpdate<Lawyer>('lawyers', 'lawyer');
  const removeLwy = useDelete('lawyers', 'lawyer');

  const tabsWithCounts = LAWYER_TABS.map((t) => ({
    value: t.value,
    label: t.label,
    count:
      t.value === 'all'
        ? counts.total
        : t.value === 'active'
          ? counts.active
          : counts.inactive,
  }));

  const filtered = useMemo(() => {
    let r = lawyers;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.specialties.some((sp) => sp.toLowerCase().includes(q)),
      );
    }
    if (statusFilter !== 'all') {
      const wantActive = statusFilter === 'active';
      r = r.filter((l) => l.isActive === wantActive);
    }
    return r;
  }, [lawyers, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSubmit = async (values: LawyerFormValues) => {
    const payload: Omit<Lawyer, 'id' | 'createdAt'> = {
      name: values.name,
      title: values.title,
      bio: values.bio ?? '',
      avatar: values.avatar ?? '',
      specialties: values.specialties,
      email: values.email,
      phone: values.phone,
      experience: values.experience,
      isActive: values.isActive,
      serviceIds: values.serviceIds,
    };
    try {
      if (editing) {
        await updateLwy.mutateAsync({ id: editing.id, patch: payload });
        notifySuccess('Đã cập nhật luật sư');
      } else {
        await createLwy.mutateAsync(payload);
        notifySuccess('Đã tạo luật sư');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
    }
  };

  const handleToggleActive = useCallback(
    async (l: Lawyer) => {
      try {
        await updateLwy.mutateAsync({
          id: l.id,
          patch: { isActive: !l.isActive },
        });
        notifySuccess(l.isActive ? `Đã tạm dừng ${l.name}` : `Đã kích hoạt ${l.name}`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
      }
    },
    [updateLwy],
  );

  return (
    <>
      <AdminPageHeader
        title="Đội ngũ luật sư"
        subtitle={`${counts.total} luật sư · ${counts.active} hoạt động · ${counts.inactive} tạm dừng`}
        actions={
          canWrite && (
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} /> Thêm luật sư
            </button>
          )
        }
      />

      <FilterTabs
        tabs={tabsWithCounts}
        activeValue={statusFilter}
        onChange={(v) => {
          setStatusFilter(v as typeof statusFilter);
          setPage(1);
        }}
      />

      <div className="admin-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên, email, chuyên môn..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Tổng: {filtered.length} / {lawyers.length}
          </span>
        </div>

        <LawyersTable
          data={paginated}
          services={services}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={(l) => {
            setEditing(l);
            setFormOpen(true);
          }}
          onDelete={(l) => setConfirmDelete(l)}
          onToggleActive={handleToggleActive}
          canWrite={canWrite}
          canDelete={canDelete}
        />

        <Pagination
          page={page}
          limit={LIMIT}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <LawyerForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        services={services}
        isLoading={createLwy.isPending || updateLwy.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa luật sư"
        message={
          confirmDelete
            ? `Bạn có chắc muốn xóa "${confirmDelete.name}"? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removeLwy.mutateAsync(confirmDelete.id);
            notifySuccess('Đã xóa luật sư');
          } catch (e) {
            notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
          } finally {
            setConfirmDelete(null);
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}

// ─── Tab 3: Assignment Matrix ───────────────────────────────────────────
function AssignmentTab() {
  const { services, lawyers, toggle, saveBatch } = useAssignment();
  const { data: allServices = [] } = useMockQuery<Service>('services');
  const { data: allLawyers = [] } = useMockQuery<Lawyer>('lawyers');

  const serviceMap = useMemo(() => {
    const m = new Map<string, Service>();
    allServices.forEach((s) => m.set(s.id, s));
    return m;
  }, [allServices]);

  const lawyerMap = useMemo(() => {
    const m = new Map<string, Lawyer>();
    allLawyers.forEach((l) => m.set(l.id, l));
    return m;
  }, [allLawyers]);

  const isAssigned = useCallback(
    (serviceId: string, lawyerId: string): boolean => {
      return Boolean(serviceMap.get(serviceId)?.lawyerIds.includes(lawyerId));
    },
    [serviceMap],
  );

  return (
    <>
      <AdminPageHeader
        title="Phân công dịch vụ × Luật sư"
        subtitle="Ma trận phân công 2D. Tick ô tương ứng để gán / bỏ gán."
      />
      <AssignmentMatrix
        services={services}
        lawyers={lawyers}
        isAssigned={isAssigned}
        onToggle={toggle}
        onSaveBatch={saveBatch}
      />
    </>
  );
}

// ─── Tab 4: Schedule ────────────────────────────────────────────────────
function ScheduleTab() {
  const { data: lawyers = [] } = useLawyers();
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('');

  const selectedLawyer = useMemo(
    () => lawyers.find((l) => l.id === selectedLawyerId) ?? null,
    [lawyers, selectedLawyerId],
  );

  return (
    <>
      <AdminPageHeader
        title="Lịch làm việc luật sư"
        subtitle="Thiết lập khung giờ làm việc cho từng luật sư theo ngày trong tuần"
      />
      <LawyerScheduleEditor
        lawyer={selectedLawyer}
        lawyers={lawyers}
        onSelectLawyer={setSelectedLawyerId}
      />
    </>
  );
}

// re-export for convenience (avoid unused import warning if needed)
void FileText;