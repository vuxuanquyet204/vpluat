'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Download,
  MessageCircle,
  Tag,
  Eye,
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
import { ChatbotSessionsTable } from './components/chatbot-sessions-table';
import { ChatbotSessionDetail } from './components/chatbot-session-detail';
import { ChatbotIntentList } from './components/chatbot-intent-list';
import { ChatbotIntentForm } from './components/chatbot-intent-form';
import { ChatbotAnalytics } from './components/chatbot-analytics';
import {
  useChatbotSessions,
  useDeleteSession,
  useChatbotIntents,
  useCreateIntent,
  useUpdateIntent,
  useDeleteIntent,
  useToggleIntent,
} from './hooks/use-chatbot';
import type { ChatbotSession, ChatbotIntent, ChatbotSessionStatus } from '@/features/admin/types';
import type { IntentFormValues } from '@/features/admin/schema';

type Tab = 'sessions' | 'intents';

const TABS: Array<{ value: Tab; label: string; icon: typeof MessageCircle }> = [
  { value: 'sessions', label: 'Sessions', icon: MessageCircle },
  { value: 'intents', label: 'Intent Training', icon: Tag },
];

export default function ChatbotPage() {
  const [tab, setTab] = useState<Tab>('sessions');
  const canRead = useCan('chatbot.read');
  const canWrite = useCan('chatbot.train');
  const canTrain = useCan('chatbot.train');
  const canDelete = useCan('chatbot.read');

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Chatbot"
        subtitle="Quản lý sessions và huấn luyện intent chatbot"
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
      ) : tab === 'sessions' ? (
        <SessionsTab canDelete={canDelete} />
      ) : (
        <IntentsTab canWrite={canWrite} canDelete={canDelete} canTrain={canTrain} />
      )}
    </div>
  );
}

// ─── Tab 1: Sessions ──────────────────────────────────────────────────
function SessionsTab({ canDelete }: { canDelete: boolean }) {
  const { data: sessions, counts } = useChatbotSessions();
  const removeSession = useDeleteSession();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ChatbotSessionStatus>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewSession, setViewSession] = useState<ChatbotSession | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ChatbotSession | null>(null);
  const LIMIT = 15;

  const tabsWithCounts = [
    { value: 'all', label: 'Tất cả', count: counts.total },
    { value: 'active', label: 'Đang chat', count: counts.active },
    { value: 'handoff', label: 'Đã handoff', count: counts.handoff },
    { value: 'ended', label: 'Kết thúc', count: counts.ended },
    { value: 'abandoned', label: 'Bỏ dở', count: counts.abandoned },
  ];

  const filtered = useMemo(() => {
    let r = sessions;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (s) =>
          (s.userName ?? '').toLowerCase().includes(q) ||
          (s.userPhone ?? '').includes(q) ||
          (s.intent ?? '').toLowerCase().includes(q) ||
          s.sessionId.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') r = r.filter((s) => s.status === statusFilter);
    return r;
  }, [sessions, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleExport = () => {
    exportToCSV(
      filtered as unknown as Record<string, unknown>[],
      `chatbot-sessions-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'sessionId', header: 'Session ID' },
        { key: 'userName', header: 'Khách' },
        { key: 'userPhone', header: 'SĐT' },
        { key: 'intent', header: 'Intent' },
        { key: 'status', header: 'Trạng thái' },
        { key: 'messageCount', header: 'Tin nhắn' },
        { key: 'startedAt', header: 'Bắt đầu' },
      ],
    );
    notifySuccess(`Đã export ${filtered.length} sessions`);
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
        <button
          type="button"
          className="action-btn"
          onClick={handleExport}
          disabled={filtered.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Download size={12} /> Export
        </button>
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
            placeholder="Tìm theo tên, SĐT, intent, sessionId..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Tổng: {filtered.length} / {sessions.length}
          </span>
        </div>

        <ChatbotSessionsTable
          data={paginated}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onView={setViewSession}
          onDelete={(s) => setConfirmDelete(s)}
          canDelete={canDelete}
        />

        <Pagination
          page={page}
          limit={LIMIT}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <ChatbotSessionDetail
        session={viewSession}
        onClose={() => setViewSession(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa session"
        message={
          confirmDelete
            ? `Bạn có chắc muốn xóa session #${confirmDelete.sessionId}?`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removeSession.mutateAsync(confirmDelete.id);
            notifySuccess('Đã xóa session');
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

// ─── Tab 2: Intents ───────────────────────────────────────────────────
function IntentsTab({
  canWrite,
  canDelete,
  canTrain,
}: {
  canWrite: boolean;
  canDelete: boolean;
  canTrain: boolean;
}) {
  const { data: sessions = [] } = useChatbotSessions();
  const { data: intents = [], counts } = useChatbotIntents();
  const createIntent = useCreateIntent();
  const updateIntent = useUpdateIntent();
  const removeIntent = useDeleteIntent();
  const toggleIntent = useToggleIntent();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ChatbotIntent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ChatbotIntent | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const handleSubmit = async (values: IntentFormValues) => {
    const payload: Omit<ChatbotIntent, 'id' | 'createdAt' | 'matchCount'> = {
      name: values.name,
      description: values.description,
      sampleUtterances: values.sampleUtterances.filter((u) => u.trim().length > 0),
      responseTemplate: values.responseTemplate,
      handoffEnabled: values.handoffEnabled,
      handoffTo: values.handoffTo || undefined,
      handoffKeywords: values.handoffKeywords,
      isActive: values.isActive,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (editing) {
        await updateIntent.mutateAsync({ id: editing.id, patch: payload });
        notifySuccess('Đã cập nhật intent');
      } else {
        await createIntent.mutateAsync({
          ...payload,
          matchCount: 0,
        } as unknown as Omit<ChatbotIntent, 'id' | 'createdAt'>);
        notifySuccess('Đã tạo intent');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
    }
  };

  const handleToggle = useCallback(
    async (i: ChatbotIntent) => {
      try {
        await toggleIntent(i.id, !i.isActive);
        notifySuccess(i.isActive ? 'Đã tạm tắt intent' : 'Đã bật intent');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Cập nhật thất bại');
      }
    },
    [toggleIntent],
  );

  const handleDuplicate = async (i: ChatbotIntent) => {
    try {
      await createIntent.mutateAsync({
        name: `${i.name} (bản sao)`,
        description: i.description,
        sampleUtterances: i.sampleUtterances,
        responseTemplate: i.responseTemplate,
        handoffEnabled: i.handoffEnabled,
        handoffTo: i.handoffTo,
        handoffKeywords: i.handoffKeywords ?? [],
        isActive: false,
        matchCount: 0,
        updatedAt: new Date().toISOString(),
      } as unknown as Omit<ChatbotIntent, 'id' | 'createdAt'>);
      notifySuccess('Đã nhân bản intent');
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
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--gray-600)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Tag size={12} /> {counts.active}/{counts.total} đang hoạt động ·{' '}
          {counts.handoff} có handoff
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              onClick={() => setAnalyticsOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Eye size={12} /> Analytics
            </button>
          )}
          {canTrain && (
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={12} /> Thêm intent
            </button>
          )}
        </div>
      </div>

      <div className="admin-card">
        {intents.length === 0 ? (
          <EmptyStateWithCta
            title="Chưa có intent nào"
            description="Tạo intent để chatbot nhận diện câu hỏi của khách."
            action={
              canTrain ? (
                <button
                  type="button"
                  className="action-btn action-btn--primary"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={12} /> Tạo intent đầu tiên
                </button>
              ) : null
            }
          />
        ) : (
          <ChatbotIntentList
            data={intents}
            onEdit={(i) => {
              setEditing(i);
              setFormOpen(true);
            }}
            onDelete={(i) => setConfirmDelete(i)}
            onToggle={handleToggle}
            onDuplicate={handleDuplicate}
            canWrite={canWrite}
            canDelete={canDelete}
          />
        )}
      </div>

      <ChatbotIntentForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        isLoading={createIntent.isPending || updateIntent.isPending}
      />

      <Modal
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        title="Chatbot Analytics"
        size="lg"
        footer={
          <button type="button" className="action-btn" onClick={() => setAnalyticsOpen(false)}>
            Đóng
          </button>
        }
      >
        <ChatbotAnalytics sessions={sessions} intents={intents} />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa intent"
        message={
          confirmDelete
            ? `Bạn có chắc muốn xóa intent "${confirmDelete.name}"?`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removeIntent.mutateAsync(confirmDelete.id);
            notifySuccess('Đã xóa intent');
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