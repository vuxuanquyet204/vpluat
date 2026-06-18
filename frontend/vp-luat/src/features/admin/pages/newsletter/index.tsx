'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Users,
  Send,
  FileText,
  Plus,
  Download,
  Upload,
  Mail,
  BarChart3,
} from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  FilterTabs,
  Pagination,
  ConfirmDialog,
  Modal,
  EmptyStateWithCta,
} from '@/features/admin/shared';
import {
  useCan,
  notifySuccess,
  notifyError,
  exportToCSV,
} from '@/features/admin/lib';
import { SubscribersTable } from './components/subscribers-table';
import { SubscriberImportDialog } from './components/subscriber-import-dialog';
import { CampaignsTable } from './components/campaigns-table';
import { CampaignForm } from './components/campaign-form';
import { CampaignAnalytics } from './components/campaign-analytics';
import { TemplatesTable } from './components/templates-table';
import { TemplateForm } from './components/template-form';
import {
  useSubscribers,
  useImportSubscribers,
  useToggleSubscriber,
  useDeleteSubscriber,
  useDeleteManySubscribers,
  useCreateSubscriber,
  useUpdateSubscriber,
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useSendCampaign,
  useCampaignAutoSend,
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from './hooks/use-newsletter';
import type { Subscriber, Campaign, CampaignStatus, NewsletterTemplate } from '@/features/admin/types';
import type {
  SubscriberFormValues,
  CampaignFormValues,
  TemplateFormValues,
} from '@/features/admin/schema';
import { getCurrentUser } from '@/features/admin/lib';

type Tab = 'subscribers' | 'campaigns' | 'templates';

const TABS: Array<{ value: Tab; label: string; icon: typeof Users }> = [
  { value: 'subscribers', label: 'Subscribers', icon: Users },
  { value: 'campaigns', label: 'Campaigns', icon: Send },
  { value: 'templates', label: 'Templates', icon: FileText },
];

export default function NewsletterPage() {
  const [tab, setTab] = useState<Tab>('subscribers');
  const canRead = useCan('newsletter.read');
  const canWrite = useCan('newsletter.write');
  const canSend = useCan('newsletter.send');
  const canDelete = useCan('newsletter.send');

  // Auto-send scheduler (always runs, RBAC enforced at mutation level)
  useCampaignAutoSend();

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Newsletter"
        subtitle="Quản lý subscribers, campaigns và templates email marketing"
      />

      <div className="filter-bar" role="tablist" style={{ marginBottom: 16 }}>
        {TABS.map((t) => {
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

      {!canRead ? (
        <div
          className="admin-card"
          style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}
        >
          Bạn không có quyền xem module này.
        </div>
      ) : tab === 'subscribers' ? (
        <SubscribersTab canWrite={canWrite} canDelete={canDelete} />
      ) : tab === 'campaigns' ? (
        <CampaignsTab canWrite={canWrite} canSend={canSend} canDelete={canDelete} />
      ) : (
        <TemplatesTab canWrite={canWrite} canDelete={canDelete} />
      )}
    </div>
  );
}

// ─── Tab 1: Subscribers ────────────────────────────────────────────────
function SubscribersTab({ canWrite, canDelete }: { canWrite: boolean; canDelete: boolean }) {
  const { data: subscribers, counts } = useSubscribers();
  const createSub = useCreateSubscriber();
  const updateSub = useUpdateSubscriber();
  const removeSub = useDeleteSubscriber();
  const removeMany = useDeleteManySubscribers();
  const toggle = useToggleSubscriber();
  const doImport = useImportSubscribers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Subscriber | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newSub, setNewSub] = useState<SubscriberFormValues>({ email: '', name: '', status: 'active', source: 'manual', tags: [] });
  const LIMIT = 20;

  const filtered = useMemo(() => {
    let r = subscribers;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          (s.name ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      r = r.filter((s) => s.status === statusFilter);
    }
    return r;
  }, [subscribers, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleCreate = async () => {
    if (!newSub.email) {
      notifyError('Lỗi', 'Email không được trống');
      return;
    }
    try {
      await createSub.mutateAsync({
        email: newSub.email,
        name: newSub.name,
        status: newSub.status,
        source: newSub.source,
        tags: newSub.tags,
        subscribedAt: new Date().toISOString(),
      } as Omit<Subscriber, 'id' | 'createdAt'>);
      notifySuccess('Đã thêm subscriber');
      setCreateOpen(false);
      setNewSub({ email: '', name: '', status: 'active', source: 'manual', tags: [] });
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể thêm');
    }
  };

  const handleToggle = useCallback(
    async (s: Subscriber) => {
      try {
        await toggle(s.id, s.status === 'active' ? 'unsubscribed' : 'active');
        notifySuccess(s.status === 'active' ? 'Đã hủy đăng ký' : 'Đã kích hoạt lại');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Cập nhật thất bại');
      }
    },
    [toggle],
  );

  const handleDelete = useCallback(
    async (s: Subscriber) => {
      try {
        await removeSub.mutateAsync(s.id);
        notifySuccess('Đã xóa subscriber');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
      }
    },
    [removeSub],
  );

  const handleExport = () => {
    exportToCSV(
      filtered as unknown as Record<string, unknown>[],
      `subscribers-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'email', header: 'Email' },
        { key: 'name', header: 'Tên' },
        { key: 'status', header: 'Trạng thái' },
        { key: 'source', header: 'Nguồn' },
        { key: 'subscribedAt', header: 'Ngày đăng ký' },
      ],
    );
    notifySuccess(`Đã export ${filtered.length} subscribers`);
  };

  const tabsWithCounts = [
    { value: 'all', label: 'Tất cả', count: counts.total },
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'unsubscribed', label: 'Unsub', count: counts.unsubscribed },
  ];

  return (
    <>
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
        <FilterTabs
          tabs={tabsWithCounts}
          activeValue={statusFilter}
          onChange={(v) => {
            setStatusFilter(v as typeof statusFilter);
            setPage(1);
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              onClick={() => setImportOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Upload size={12} /> Import CSV
            </button>
          )}
          <button
            type="button"
            className="action-btn"
            onClick={handleExport}
            disabled={filtered.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Download size={12} /> Export
          </button>
          {canWrite && (
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={() => setCreateOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={12} /> Tạo subscriber
            </button>
          )}
        </div>
      </div>

      {selectedIds.length > 0 && canDelete && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--gray-800, #1F2937)',
            color: 'white',
            borderRadius: 6,
            marginBottom: 12,
            fontSize: '0.8rem',
          }}
        >
          <span>Đã chọn {selectedIds.length} subscribers</span>
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
            onClick={() => setSelectedIds([])}
          >
            Hủy
          </button>
        </div>
      )}

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
            placeholder="Tìm theo email, tên..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Tổng: {filtered.length} / {subscribers.length}
          </span>
        </div>

        <SubscribersTable
          data={paginated}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onDelete={(s) => setConfirmDelete(s)}
          onToggle={handleToggle}
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

      <SubscriberImportDialog
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={doImport}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa subscriber"
        message={
          confirmDelete ? `Bạn có chắc muốn xóa "${confirmDelete.email}"?` : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (confirmDelete) {
            await handleDelete(confirmDelete);
            setConfirmDelete(null);
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title={`Xóa ${selectedIds.length} subscribers`}
        message="Bạn có chắc muốn xóa tất cả subscribers đã chọn?"
        confirmLabel="Xóa tất cả"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          try {
            await removeMany.mutateAsync(selectedIds);
            notifySuccess(`Đã xóa ${selectedIds.length} subscribers`);
            setSelectedIds([]);
          } catch (e) {
            notifyError('Lỗi', e instanceof Error ? e.message : 'Xóa thất bại');
          } finally {
            setConfirmBulkDelete(false);
          }
        }}
        onClose={() => setConfirmBulkDelete(false)}
      />

      {/* Create Subscriber Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo subscriber mới"
        size="sm"
        footer={
          <>
            <button type="button" className="action-btn" onClick={() => setCreateOpen(false)}>
              Hủy
            </button>
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={handleCreate}
              disabled={createSub.isPending}
            >
              {createSub.isPending ? 'Đang tạo...' : 'Tạo subscriber'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--gray-700)',
                marginBottom: 6,
              }}
            >
              Email *
            </label>
            <input
              type="email"
              value={newSub.email}
              onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
              placeholder="email@example.com"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 6,
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--gray-700)',
                marginBottom: 6,
              }}
            >
              Tên
            </label>
            <input
              type="text"
              value={newSub.name ?? ''}
              onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
              placeholder="Nguyễn Văn A"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 6,
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Tab 2: Campaigns ──────────────────────────────────────────────────
function CampaignsTab({
  canWrite,
  canSend,
  canDelete,
}: {
  canWrite: boolean;
  canSend: boolean;
  canDelete: boolean;
}) {
  const { data: campaigns, counts } = useCampaigns();
  const { data: templates = [] } = useTemplates();
  const { data: allSubs = [] } = useSubscribers();
  const createCamp = useCreateCampaign();
  const updateCamp = useUpdateCampaign();
  const removeCamp = useDeleteCampaign();
  const send = useSendCampaign();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Campaign | null>(null);
  const [statsCampaign, setStatsCampaign] = useState<Campaign | null>(null);
  const LIMIT = 15;

  const tabsWithCounts = [
    { value: 'all', label: 'Tất cả', count: counts.total },
    { value: 'draft', label: 'Nháp', count: counts.draft },
    { value: 'scheduled', label: 'Lên lịch', count: counts.scheduled },
    { value: 'sent', label: 'Đã gửi', count: counts.sent },
  ];

  const filtered = useMemo(() => {
    let r = campaigns;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') r = r.filter((c) => c.status === statusFilter);
    return r;
  }, [campaigns, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSubmit = async (
    values: CampaignFormValues,
    action: 'draft' | 'schedule' | 'send',
  ) => {
    const payload: Omit<Campaign, 'id' | 'createdAt' | 'recipientCount' | 'openRate' | 'clickRate' | 'bounceRate' | 'unsubRate'> = {
      name: values.name,
      subject: values.subject,
      body: values.body,
      segment: values.segment,
      customEmails: values.customEmails,
      status: action === 'send' ? 'sent' : action === 'schedule' ? 'scheduled' : 'draft',
      scheduledAt: values.scheduledAt || undefined,
      sentAt: action === 'send' ? new Date().toISOString() : undefined,
      createdByName: getCurrentUser()?.name,
      updatedAt: new Date().toISOString(),
    };
    try {
      let saved: Campaign | null = null;
      if (editing) {
        saved = (await updateCamp.mutateAsync({
          id: editing.id,
          patch: payload,
        })) as Campaign;
        notifySuccess('Đã cập nhật campaign');
      } else {
        saved = (await createCamp.mutateAsync({
          ...payload,
          recipientCount: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          unsubRate: 0,
        } as unknown as Omit<Campaign, 'id' | 'createdAt'>)) as Campaign;
        notifySuccess(
          action === 'send'
            ? 'Đã tạo và gửi campaign'
            : action === 'schedule'
              ? 'Đã lên lịch campaign'
              : 'Đã lưu nháp',
        );
      }
      // Nếu action = send, gọi send hook
      if (action === 'send' && saved) {
        await send(saved.id);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
    }
  };

  const handleSend = async (c: Campaign) => {
    if (!canSend) {
      notifyError('Không có quyền', 'Bạn cần quyền newsletter.send');
      return;
    }
    await send(c.id);
  };

  return (
    <>
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
        <FilterTabs
          tabs={tabsWithCounts}
          activeValue={statusFilter}
          onChange={(v) => {
            setStatusFilter(v as typeof statusFilter);
            setPage(1);
          }}
        />
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
            <Plus size={12} /> Tạo campaign
          </button>
        )}
      </div>

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
            placeholder="Tìm theo tên campaign, subject..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Tổng: {filtered.length} / {campaigns.length}
          </span>
        </div>

        <CampaignsTable
          data={paginated}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={(c) => {
            setEditing(c);
            setFormOpen(true);
          }}
          onDelete={(c) => setConfirmDelete(c)}
          onSend={handleSend}
          onViewStats={(c) => setStatsCampaign(c)}
          canWrite={canWrite}
          canSend={canSend}
          canDelete={canDelete}
        />

        <Pagination
          page={page}
          limit={LIMIT}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <CampaignForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        templates={templates}
        subscribers={allSubs}
        isLoading={createCamp.isPending || updateCamp.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa campaign"
        message={
          confirmDelete ? `Bạn có chắc muốn xóa campaign "${confirmDelete.name}"?` : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removeCamp.mutateAsync(confirmDelete.id);
            notifySuccess('Đã xóa campaign');
          } catch (e) {
            notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
          } finally {
            setConfirmDelete(null);
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />

      <Modal
        isOpen={Boolean(statsCampaign)}
        onClose={() => setStatsCampaign(null)}
        title={statsCampaign ? `Analytics — ${statsCampaign.name}` : 'Analytics'}
        size="md"
        footer={
          <button type="button" className="action-btn" onClick={() => setStatsCampaign(null)}>
            Đóng
          </button>
        }
      >
        {statsCampaign && <CampaignAnalytics campaign={statsCampaign} />}
      </Modal>
    </>
  );
}

// ─── Tab 3: Templates ──────────────────────────────────────────────────
function TemplatesTab({ canWrite, canDelete }: { canWrite: boolean; canDelete: boolean }) {
  const { data: templates = [] } = useTemplates();
  const createTpl = useCreateTemplate();
  const updateTpl = useUpdateTemplate();
  const removeTpl = useDeleteTemplate();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NewsletterTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<NewsletterTemplate | null>(null);

  const handleSubmit = async (values: TemplateFormValues) => {
    const payload: Omit<NewsletterTemplate, 'id' | 'createdAt'> = {
      name: values.name,
      subject: values.subject,
      body: values.body,
      description: values.description,
      isDefault: values.isDefault,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (editing) {
        await updateTpl.mutateAsync({ id: editing.id, patch: payload });
        notifySuccess('Đã cập nhật template');
      } else {
        await createTpl.mutateAsync(payload);
        notifySuccess('Đã tạo template');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
    }
  };

  const handleDuplicate = async (t: NewsletterTemplate) => {
    try {
      await createTpl.mutateAsync({
        name: `${t.name} (bản sao)`,
        subject: t.subject,
        body: t.body,
        description: t.description,
        isDefault: false,
        updatedAt: new Date().toISOString(),
      } as Omit<NewsletterTemplate, 'id' | 'createdAt'>);
      notifySuccess('Đã nhân bản template');
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Nhân bản thất bại');
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--gray-600)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Mail size={12} /> {templates.length} templates
        </span>
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
            <Plus size={12} /> Tạo template
          </button>
        )}
      </div>

      <div className="admin-card">
        {templates.length === 0 ? (
          <EmptyStateWithCta
            title="Chưa có template"
            description="Tạo template để dùng lại cho nhiều campaign."
            action={
              canWrite ? (
                <button
                  type="button"
                  className="action-btn action-btn--primary"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={12} /> Tạo template
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <TemplatesTable
              data={templates}
              onEdit={(t) => {
                setEditing(t);
                setFormOpen(true);
              }}
              onDelete={(t) => setConfirmDelete(t)}
              onDuplicate={handleDuplicate}
              canWrite={canWrite}
              canDelete={canDelete}
            />
            {canWrite && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={12} /> Thêm template khác
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <TemplateForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        isLoading={createTpl.isPending || updateTpl.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa template"
        message={confirmDelete ? `Bạn có chắc muốn xóa template "${confirmDelete.name}"?` : ''}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removeTpl.mutateAsync(confirmDelete.id);
            notifySuccess('Đã xóa template');
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

void BarChart3;