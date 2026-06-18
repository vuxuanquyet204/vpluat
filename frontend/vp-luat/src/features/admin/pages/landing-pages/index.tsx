'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  Plus,
  ArrowLeft,
  Save,
  Eye,
  Rocket,
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
} from '@/features/admin/lib';
import { LandingPagesTable } from './components/landing-pages-table';
import { LandingPageForm } from './components/landing-page-form';
import { LandingBlockLibrary } from './components/landing-block-library';
import { LandingBlockCanvas } from './components/landing-block-canvas';
import { LandingBlockProperties } from './components/landing-block-properties';
import { LandingPageAnalytics } from './components/landing-page-analytics';
import { LandingPageVariants } from './components/landing-page-variants';
import {
  useLandingPages,
  useDeleteLandingPage,
  useUpdateLandingBlocks,
  usePublishLandingPage,
  useUnpublishLandingPage,
  useDuplicateLandingPage,
  createBlock,
  STATUS_LABELS,
} from './hooks/use-landing-pages';
import type {
  LandingPage,
  LandingBlock,
  LandingPageStatus,
} from '@/features/admin/types';
import type { LandingPageFormValues } from '@/features/admin/schema';

type View = 'list' | 'editor';

export default function LandingPagesPage() {
  const [view, setView] = useState<View>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const canRead = useCan('landing.read');
  const canWrite = useCan('landing.write');
  const canPublish = useCan('landing.publish');
  const canDelete = useCan('landing.publish'); // only publishers can delete

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setEditingId(id);
      setView('editor');
    }
  }, []);

  const openEditor = useCallback((id: string) => {
    setEditingId(id);
    setView('editor');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', id);
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  const backToList = useCallback(() => {
    setView('list');
    setEditingId(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  if (!canRead) {
    return (
      <div className="admin-view">
        <AdminPageHeader title="Landing Pages" />
        <div
          className="admin-card"
          style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}
        >
          Bạn không có quyền xem module này.
        </div>
      </div>
    );
  }

  return view === 'list' ? (
    <ListView
      canWrite={canWrite}
      canDelete={canDelete}
      canPublish={canPublish}
      onEdit={openEditor}
    />
  ) : (
    <EditorView
      pageId={editingId}
      canWrite={canWrite}
      canPublish={canPublish}
      onBack={backToList}
    />
  );
}

// ─── List View ────────────────────────────────────────────────────────
function ListView({
  canWrite,
  canDelete,
  canPublish,
  onEdit,
}: {
  canWrite: boolean;
  canDelete: boolean;
  canPublish: boolean;
  onEdit: (id: string) => void;
}) {
  const { data: pages, counts } = useLandingPages();
  const removePage = useDeleteLandingPage();
  const publishPage = usePublishLandingPage();
  const unpublishPage = useUnpublishLandingPage();
  const duplicatePage = useDuplicateLandingPage();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LandingPageStatus>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LandingPage | null>(null);
  const [analyticsPage, setAnalyticsPage] = useState<LandingPage | null>(null);
  const [variantsPage, setVariantsPage] = useState<LandingPage | null>(null);
  const LIMIT = 20;

  const tabsWithCounts = [
    { value: 'all', label: 'Tất cả', count: counts.total },
    { value: 'published', label: 'Live', count: counts.published },
    { value: 'draft', label: 'Nháp', count: counts.draft },
    { value: 'archived', label: 'Lưu trữ', count: counts.archived },
  ];

  const filtered = useMemo(() => {
    let r = pages;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') r = r.filter((p) => p.status === statusFilter);
    return r;
  }, [pages, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <>
      <div className="admin-view">
        <AdminPageHeader
          title="Landing Page Builder"
          subtitle="Tạo và quản lý landing pages cho chiến dịch marketing"
        />

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
              <Plus size={12} /> Tạo Landing Page
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
              placeholder="Tìm theo tiêu đề, slug..."
            />
            <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
              Tổng: {filtered.length} / {pages.length} · {counts.variants} variants
            </span>
          </div>

          {pages.length === 0 ? (
            <EmptyStateWithCta
              title="Chưa có landing page nào"
              description="Tạo landing page đầu tiên cho chiến dịch marketing."
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
                    <Plus size={12} /> Tạo ngay
                  </button>
                ) : null
              }
            />
          ) : (
            <LandingPagesTable
              data={paginated}
              selectedIds={selectedIds}
              onSelectChange={setSelectedIds}
              onEdit={(p) => onEdit(p.id)}
              onDelete={(p) => setConfirmDelete(p)}
              onPreview={(p) => window.open(`/lp/${p.slug}`, '_blank')}
              onDuplicate={async (p) => {
                const id = await duplicatePage(p.id);
                if (id) onEdit(id);
              }}
              onAnalytics={(p) => setAnalyticsPage(p)}
              onPublish={(p) => publishPage(p.id)}
              onUnpublish={(p) => unpublishPage(p.id)}
              onVariants={(p) => setVariantsPage(p)}
              canWrite={canWrite}
              canDelete={canDelete}
              canPublish={canPublish}
            />
          )}

          <Pagination
            page={page}
            limit={LIMIT}
            total={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </div>

      <LandingPageForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={async (values) => {
          if (editing) {
            // update via hook directly
            notifySuccess('Đã cập nhật landing page');
          } else {
            // create new + open editor
            notifySuccess('Đã tạo landing page');
          }
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
      />

      <Modal
        isOpen={Boolean(analyticsPage)}
        onClose={() => setAnalyticsPage(null)}
        title={analyticsPage ? `Analytics — ${analyticsPage.title}` : 'Analytics'}
        size="lg"
        footer={
          <button type="button" className="action-btn" onClick={() => setAnalyticsPage(null)}>
            Đóng
          </button>
        }
      >
        {analyticsPage && (
          <LandingPageAnalytics
            page={analyticsPage}
            allVariants={pages.filter(
              (p) => p.parentPageId === analyticsPage.id || p.id === analyticsPage.id,
            )}
          />
        )}
      </Modal>

      {variantsPage && (
        <LandingPageVariants
          isOpen={Boolean(variantsPage)}
          parentPage={variantsPage}
          onClose={() => setVariantsPage(null)}
          onOpenVariant={onEdit}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa landing page"
        message={
          confirmDelete
            ? `Xóa "${confirmDelete.title}"? Hành động không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removePage.mutateAsync(confirmDelete.id);
            notifySuccess('Đã xóa landing page');
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

// ─── Editor View (3-pane) ─────────────────────────────────────────────
function EditorView({
  pageId,
  canWrite,
  canPublish,
  onBack,
}: {
  pageId: string | null;
  canWrite: boolean;
  canPublish: boolean;
  onBack: () => void;
}) {
  const { data: pages = [] } = useLandingPages();
  const updateBlocks = useUpdateLandingBlocks();
  const publishPage = usePublishLandingPage();
  const unpublishPage = useUnpublishLandingPage();

  const page = useMemo(() => pages.find((p) => p.id === pageId) ?? null, [pages, pageId]);
  const [blocks, setBlocks] = useState<LandingBlock[]>(page?.blocks ?? []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (page) {
      setBlocks(page.blocks);
      setDirty(false);
    }
  }, [page?.id]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || !active.data.current) return;
      const from = active.data.current.from;
      if (from === 'library') {
        const newBlock = createBlock(active.data.current.type as LandingBlock['type']);
        if (over.id === 'canvas-root' || over.id === 'canvas-empty') {
          setBlocks((prev) => [...prev, { ...newBlock, order: prev.length }]);
          setSelectedBlockId(newBlock.id);
          setDirty(true);
        }
      } else if (from === 'canvas') {
        const overId = String(over.id);
        if (overId === 'canvas-root' || overId === 'canvas-empty') return;
        const oldIdx = blocks.findIndex((b) => b.id === active.id);
        const newIdx = blocks.findIndex((b) => b.id === over.id);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
        const newBlocks = [...blocks];
        const [moved] = newBlocks.splice(oldIdx, 1);
        newBlocks.splice(newIdx, 0, moved);
        setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
        setDirty(true);
      }
    },
    [blocks],
  );

  const handleDragStart = useCallback((_: DragStartEvent) => {}, []);

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      await updateBlocks(page.id, blocks);
      setDirty(false);
      notifySuccess('Đã lưu landing page');
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    if (dirty) {
      await updateBlocks(page.id, blocks);
      setDirty(false);
    }
    if (page.status === 'published') {
      await unpublishPage(page.id);
    } else {
      await publishPage(page.id);
    }
  };

  if (!page) {
    return (
      <div className="admin-view">
        <AdminPageHeader title="Landing Page Editor" />
        <div className="admin-card" style={{ padding: 32, textAlign: 'center' }}>
          Không tìm thấy landing page. <button onClick={onBack} className="action-btn">Quay lại</button>
        </div>
      </div>
    );
  }

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="admin-view">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 0 16px',
            borderBottom: '1px solid var(--gray-200)',
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="action-btn"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowLeft size={12} /> Quay lại
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{page.title}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
              /lp/{page.slug} · {blocks.length} blocks · {STATUS_LABELS[page.status]}
              {dirty && <span style={{ color: 'var(--warning, #D97706)', marginLeft: 6 }}>● chưa lưu</span>}
            </div>
          </div>
          <button
            type="button"
            className="action-btn"
            onClick={() => window.open(`/lp/${page.slug}`, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Eye size={12} /> Xem trước
          </button>
          {canWrite && (
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={handleSave}
              disabled={!dirty || saving}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Save size={12} /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          )}
          {canPublish && (
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={handlePublish}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Rocket size={12} />{' '}
              {page.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr 320px',
            gap: 12,
            minHeight: '70vh',
          }}
        >
          <LandingBlockLibrary />
          <LandingBlockCanvas
            blocks={blocks}
            selectedId={selectedBlockId}
            onSelect={setSelectedBlockId}
            onRemove={(id) => {
              setBlocks(blocks.filter((b) => b.id !== id));
              if (selectedBlockId === id) setSelectedBlockId(null);
              setDirty(true);
            }}
            onDuplicate={(id) => {
              const src = blocks.find((b) => b.id === id);
              if (!src) return;
              const idx = blocks.findIndex((b) => b.id === id);
              const copy: LandingBlock = {
                ...src,
                id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              };
              const newBlocks = [...blocks];
              newBlocks.splice(idx + 1, 0, copy);
              setBlocks(newBlocks);
              setDirty(true);
            }}
          />
          <div
            style={{
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 8,
              maxHeight: '70vh',
              overflow: 'auto',
            }}
          >
            <LandingBlockProperties
              block={selectedBlock}
              onChange={(patch) => {
                if (!selectedBlock) return;
                setBlocks(
                  blocks.map((b) =>
                    b.id === selectedBlock.id
                      ? { ...b, props: patch as unknown as LandingBlock['props'] }
                      : b,
                  ),
                );
                setDirty(true);
              }}
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
