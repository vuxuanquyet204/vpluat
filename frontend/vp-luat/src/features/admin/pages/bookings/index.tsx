'use client';

import { useState, useMemo, useCallback } from 'react';
import { Plus, LayoutList, Calendar, Grid3x3, Download, Eye, Phone, Mail, MapPin, CheckCircle2, XCircle, PhoneCall, UserPlus } from 'lucide-react';
import { AdminPageHeader, FilterTabs, SearchBar, RowUser, StatusBadge, type StatusVariant } from '@/features/admin/shared';
import { ConfirmDialog } from '@/features/admin/components';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { BookingsCalendar } from './components/bookings-calendar';
import { BookingForm } from './components/booking-form';
import { BookingDetailDrawer } from './components/booking-detail-drawer';
import { BookingFilters, type BookingFiltersValue } from './components/booking-filters';
import { BookingAvailabilityView } from './components/booking-availability-view';
import { useBookings } from './hooks/use-bookings';
import { useLawyers } from './hooks/use-lawyers';
import {
  useCreateBooking,
  useUpdateBooking,
  useChangeBookingStatus,
  useDeleteBooking,
} from './hooks/use-booking-mutations';
import { useMockQuery, useCan, notifySuccess, notifyError, notifyInfo, exportToCSV, pushInAppNotification } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type { Booking, BookingStatus, BookingMethod, Lead, Lawyer } from '@/features/admin/types';

const BOOKING_STATUS_MAP: Record<BookingStatus, { label: string; variant: StatusVariant }> = {
  pending: { label: 'Chờ xác nhận', variant: 'yellow' },
  confirmed: { label: 'Đã xác nhận', variant: 'blue' },
  completed: { label: 'Hoàn tất', variant: 'green' },
  cancelled: { label: 'Đã hủy', variant: 'red' },
};

const METHOD_LABELS: Record<BookingMethod, string> = {
  office: 'Tại VP',
  online: 'Online',
  phone: 'Phone',
};

const METHOD_ICONS: Record<BookingMethod, React.ReactNode> = {
  office: <MapPin size={12} />,
  online: <Phone size={12} />,
  phone: <Phone size={12} />,
};

const STATUS_ICONS: Record<BookingStatus, React.ReactNode> = {
  pending: <PhoneCall size={9} strokeWidth={3} />,
  confirmed: <CheckCircle2 size={9} strokeWidth={3} />,
  cancelled: <XCircle size={9} strokeWidth={3} />,
  completed: <CheckCircle2 size={9} strokeWidth={3} />,
};

type ViewMode = 'list' | 'calendar' | 'availability';

export default function BookingsPage() {
  const qc = useQueryClientSafe();
  const canCreate = useCan('booking.write');
  const canDelete = useCan('booking.delete');

  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filters, setFilters] = useState<BookingFiltersValue>({
    status: 'all',
    lawyer: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formDefaults, setFormDefaults] = useState<{ date?: string; time?: string; lawyer?: string }>({});
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Booking | null>(null);
  const [createLeadBooking, setCreateLeadBooking] = useState<Booking | null>(null);

  const { data: leads = [] } = useMockQuery<Lead>('leads');
  const { data: realLawyers = [] } = useLawyers();
  
  // Fallback to mock lawyers if API fails
  const { data: mockLawyers = [] } = useMockQuery<Lawyer>('lawyers');
  const allLawyers = realLawyers.length > 0 ? realLawyers : mockLawyers;
  
  const activeLawyerNames = useMemo(
    () => allLawyers.filter((l) => l.isActive).map((l) => l.name),
    [allLawyers],
  );

  const allBookings = useBookings({ search });

  // Counts by status
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allBookings.length };
    for (const s of ['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]) {
      c[s] = allBookings.filter((b) => b.status === s).length;
    }
    return c;
  }, [allBookings]);

  const filtered = useMemo(() => {
    let r = allBookings;
    if (statusFilter !== 'all') r = r.filter((b) => b.status === statusFilter);
    if (filters.status !== 'all') r = r.filter((b) => b.status === filters.status);
    if (filters.lawyer !== 'all') r = r.filter((b) => b.lawyer === filters.lawyer);
    if (filters.method !== 'all') r = r.filter((b) => b.method === filters.method);
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      r = r.filter((b) => new Date(b.date).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 24 * 60 * 60 * 1000;
      r = r.filter((b) => new Date(b.date).getTime() <= to);
    }
    return r;
  }, [allBookings, statusFilter, filters]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));

  // Stats cards
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: allBookings.length,
      todayCount: allBookings.filter((b) => b.date === today).length,
      pendingCount: counts.pending ?? 0,
      confirmedCount: counts.confirmed ?? 0,
      completedCount: counts.completed ?? 0,
    };
  }, [allBookings, counts]);

  // Mutations
  const create = useCreateBooking();
  const update = useUpdateBooking();
  const changeStatus = useChangeBookingStatus();
  const remove = useDeleteBooking();

  const handleSubmitForm = useCallback(
    async (values: import('@/features/admin/schema').BookingFormValues) => {
      try {
        if (editingBooking) {
          await update.mutateAsync({ id: editingBooking.id, patch: values as Partial<Booking> });
          notifySuccess('Đã cập nhật lịch hẹn');
        } else {
          await create.mutateAsync(values as Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>);
        }
        setFormOpen(false);
        setEditingBooking(null);
        setFormDefaults({});
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
      }
    },
    [editingBooking, create, update],
  );

  const handleBulkConfirm = useCallback(
    async (selected: Booking[]) => {
      try {
        for (const b of selected) {
          await changeStatus.mutateAsync({ id: b.id, status: 'confirmed' });
        }
        notifySuccess(`Đã xác nhận ${selected.length} lịch hẹn`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
      }
    },
    [changeStatus],
  );

  const handleBulkCancel = useCallback(
    async (selected: Booking[]) => {
      try {
        for (const b of selected) {
          await changeStatus.mutateAsync({ id: b.id, status: 'cancelled', cancelledReason: 'Bulk cancel' });
        }
        notifySuccess(`Đã hủy ${selected.length} lịch hẹn`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể hủy');
      }
    },
    [changeStatus],
  );

  const handleCreateLead = useCallback(
    (booking: Booking) => {
      // Tạo lead mới từ booking chưa có leadId
      if (booking.leadId) {
        notifyInfo('Booking này đã liên kết với lead');
        return;
      }
      const newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
        name: booking.customerName,
        phone: booking.customerPhone,
        email: booking.customerEmail,
        service: booking.service,
        source: 'other',
        status: 'contacted',
        assignedTo: 'Lan',
        notes: `Tạo tự động từ booking ${booking.id} ngày ${booking.date}`,
      };
      const lead = MockDB.insert<Lead>('leads', newLead as Lead);
      // Update booking với leadId
      update.mutate({ id: booking.id, patch: { leadId: lead.id } as Partial<Booking> });
      pushInAppNotification({
        type: 'lead_new',
        title: 'Lead mới từ booking',
        message: `${lead.name} vừa được tạo từ booking ${booking.id}`,
        link: `/admin/crm`,
      });
      notifySuccess('Đã tạo lead', lead.name);
    },
    [update],
  );

  const handleExport = useCallback(() => {
    exportToCSV(
      filtered as unknown as Record<string, unknown>[],
      `bookings-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'customerName', header: 'Khách hàng' },
        { key: 'customerPhone', header: 'SĐT' },
        { key: 'customerEmail', header: 'Email' },
        { key: 'service', header: 'Dịch vụ' },
        { key: 'lawyer', header: 'Luật sư' },
        { key: 'method', header: 'Hình thức' },
        { key: 'date', header: 'Ngày' },
        { key: 'time', header: 'Giờ' },
        { key: 'status', header: 'Trạng thái' },
      ],
    );
    notifySuccess(`Đã export ${filtered.length} booking`);
  }, [filtered]);

  const columns: DataTableColumn<Booking>[] = useMemo(
    () => [
      {
        key: 'customerName',
        header: 'Khách hàng',
        sortable: true,
        cell: (b) => (
          <RowUser initials={b.customerName} name={b.customerName} sub={`${b.customerPhone} · ${b.service}`} />
        ),
      },
      {
        key: 'lawyer',
        header: 'Luật sư',
        cell: (b) => <span style={{ color: 'var(--gray-600)' }}>{b.lawyer}</span>,
      },
      {
        key: 'date',
        header: 'Ngày',
        sortable: true,
        cell: (b) => (
          <div style={{ fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
              {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(b.date))}
            </div>
            <div style={{ color: 'var(--gray-400)', fontSize: '0.72rem' }}>{b.time}</div>
          </div>
        ),
      },
      {
        key: 'method',
        header: 'Hình thức',
        cell: (b) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--gray-600)' }}>
            {METHOD_ICONS[b.method]} {METHOD_LABELS[b.method]}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        sortable: true,
        cell: (b) => {
          const s = BOOKING_STATUS_MAP[b.status];
          return (
            <StatusBadge label={s.label} variant={s.variant} icon={STATUS_ICONS[b.status]} />
          );
        },
      },
      {
        key: 'actions',
        header: '',
        cell: (b) => (
          <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Xem"
              onClick={() => setDetailBooking(b)}
            >
              <Eye size={12} />
            </button>
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Gọi"
              onClick={() => window.open(`tel:${b.customerPhone}`)}
            >
              <Phone size={12} />
            </button>
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Email"
              onClick={() => window.open(`mailto:${b.customerEmail}`)}
            >
              <Mail size={12} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Lịch hẹn & Booking"
        subtitle={`${stats.total} lịch hẹn · ${stats.todayCount} hôm nay · ${stats.pendingCount} chờ xác nhận`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {(['list', 'calendar', 'availability'] as ViewMode[]).map((v) => {
              const Icon = v === 'list' ? LayoutList : v === 'calendar' ? Calendar : Grid3x3;
              return (
                <button
                  key={v}
                  type="button"
                  className={`action-btn ${view === v ? 'action-btn--primary' : ''}`}
                  onClick={() => setView(v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Icon size={14} />
                  {v === 'list' ? 'Danh sách' : v === 'calendar' ? 'Lịch' : 'Slot trống'}
                </button>
              );
            })}
            {view === 'list' && (
              <button
                type="button"
                className="action-btn"
                onClick={handleExport}
                disabled={filtered.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Download size={14} /> Export
              </button>
            )}
            {canCreate && (
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={() => {
                  setEditingBooking(null);
                  setFormDefaults({});
                  setFormOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Tạo lịch hẹn
              </button>
            )}
          </div>
        }
      />

      {view === 'list' && (
        <>
          <FilterTabs
            tabs={[
              { value: 'all', label: 'Tất cả', count: counts.all ?? 0 },
              { value: 'pending', label: 'Chờ xác nhận', count: counts.pending ?? 0 },
              { value: 'confirmed', label: 'Đã xác nhận', count: counts.confirmed ?? 0 },
              { value: 'completed', label: 'Hoàn tất', count: counts.completed ?? 0 },
              { value: 'cancelled', label: 'Đã hủy', count: counts.cancelled ?? 0 },
            ]}
            activeValue={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          />

          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <SearchBar
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Tìm theo tên, SĐT, dịch vụ, LS..."
              />
              <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
                Tổng: {filtered.length}
              </span>
            </div>

            <BookingFilters value={filters} onChange={setFilters} lawyers={activeLawyerNames} />

            <DataTableV2<Booking>
              data={paginated}
              columns={columns}
              onRowClick={(b) => setDetailBooking(b)}
              defaultSort={{ by: 'date', dir: 'desc' }}
              emptyTitle="Chưa có lịch hẹn"
              emptyDescription="Lịch hẹn từ landing page hoặc chatbot sẽ tự động xuất hiện ở đây."
              emptyAction={
                canCreate ? (
                  <button
                    type="button"
                    className="action-btn action-btn--primary"
                    onClick={() => setFormOpen(true)}
                  >
                    <Plus size={12} /> Tạo lịch hẹn đầu tiên
                  </button>
                ) : undefined
              }
              selectable
              bulkActions={
                canCreate
                  ? [
                      {
                        label: 'Xác nhận',
                        icon: <CheckCircle2 size={12} />,
                        variant: 'primary',
                        onClick: handleBulkConfirm,
                      },
                      {
                        label: 'Hủy',
                        icon: <XCircle size={12} />,
                        variant: 'danger',
                        onClick: handleBulkCancel,
                      },
                    ]
                  : []
              }
            />

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
        </>
      )}

      {view === 'calendar' && (
        <BookingsCalendar
          lawyerFilter={filters.lawyer}
          onSelectBooking={(b) => setDetailBooking(b)}
          onCreateAt={(date, time) => {
            setEditingBooking(null);
            setFormDefaults({ date, time });
            setFormOpen(true);
          }}
        />
      )}

      {view === 'availability' && (
        <BookingAvailabilityView
          onCreateAt={(date, time, lawyer) => {
            setEditingBooking(null);
            setFormDefaults({ date, time, lawyer });
            setFormOpen(true);
          }}
        />
      )}

      {formOpen && (
        <BookingForm
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingBooking(null);
            setFormDefaults({});
          }}
          onSubmit={handleSubmitForm}
          initial={editingBooking}
          leads={leads}
          lawyers={allLawyers.filter((l) => l.isActive)}
          isLoading={create.isPending || update.isPending}
          defaultDate={formDefaults.date}
          defaultTime={formDefaults.time}
          defaultLawyer={formDefaults.lawyer}
        />
      )}

      <BookingDetailDrawer
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
        onDeleted={() => setDetailBooking(null)}
        onCreateLead={handleCreateLead}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            remove.mutate(confirmDelete.id, {
              onSuccess: () => notifySuccess(`Đã xóa lịch hẹn của "${confirmDelete.customerName}"`),
            });
            setConfirmDelete(null);
          }
        }}
        title="Xóa lịch hẹn"
        message={`Bạn có chắc muốn xóa lịch hẹn của "${confirmDelete?.customerName}"?`}
        confirmLabel="Xóa"
        variant="danger"
      />
    </div>
  );
}

// Helper hook tránh import useQueryClient trong test SSR
import { useQueryClient } from '@tanstack/react-query';
function useQueryClientSafe() {
  return useQueryClient();
}
