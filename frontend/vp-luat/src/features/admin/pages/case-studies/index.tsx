'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus, Download, Pencil, Trash2, Eye, Globe, GlobeLock } from 'lucide-react';
import { AdminPageHeader, SearchBar, ConfirmDialog } from '@/features/admin/shared';
import { useCan, exportToCSV, notifySuccess, notifyError } from '@/features/admin/lib';
import type { CaseStudy } from '@/lib/api/admin-case-study';
import {
  useCaseStudies,
  useCreateCaseStudy,
  useUpdateCaseStudy,
  usePublishCaseStudy,
  useUnpublishCaseStudy,
  useDeleteCaseStudy,
} from './hooks/use-case-studies';
import { CaseStudyForm } from './components/case-study-form';

type StatusFilter = 'all' | 'published' | 'draft';

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
];

export default function CaseStudiesPage() {
  const canWrite = useCan('blog.write');
  const canPublish = useCan('blog.publish');
  const canDelete = useCan('blog.delete');

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Data
  const { data: caseStudies = [], isLoading } = useCaseStudies();

  // Mutations
  const createMutation = useCreateCaseStudy();
  const updateMutation = useUpdateCaseStudy();
  const publishMutation = usePublishCaseStudy();
  const unpublishMutation = useUnpublishCaseStudy();
  const deleteMutation = useDeleteCaseStudy();

  // Form state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CaseStudy | null>(null);

  // Filter
  const filtered = useMemo(() => {
    let result = caseStudies;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (cs) =>
          (cs.titleVi ?? '').toLowerCase().includes(q) ||
          (cs.titleEn ?? '').toLowerCase().includes(q) ||
          cs.slug.toLowerCase().includes(q) ||
          (cs.excerptVi ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      const isPublished = statusFilter === 'published';
      result = result.filter((cs) => cs.published === isPublished);
    }
    return result;
  }, [caseStudies, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));

  // Stats
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: caseStudies.length };
    counts.published = caseStudies.filter((cs) => cs.published).length;
    counts.draft = caseStudies.filter((cs) => !cs.published).length;
    return counts;
  }, [caseStudies]);

  const tabsWithCounts = STATUS_TABS.map((t) => ({
    ...t,
    count: statusCounts[t.value] ?? 0,
  }));

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingCase(null);
    setEditorOpen(true);
  }, []);

  const handleOpenEdit = useCallback((cs: CaseStudy) => {
    setEditingCase(cs);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    async (values: {
      slug: string;
      titleVi: string;
      titleEn?: string;
      excerptVi?: string;
      excerptEn?: string;
      contentVi?: string;
      contentEn?: string;
      outcome?: string;
      thumbnailUrl?: string;
      ogImageUrl?: string;
      serviceIds?: string[];
      isPublished: boolean;
      isFeatured: boolean;
    }) => {
      try {
        if (editingCase) {
          await updateMutation({
            id: editingCase.id,
            patch: values,
          });
        } else {
          await createMutation(values);
        }
        setEditorOpen(false);
        setEditingCase(null);
      } catch (e) {
        // Error handled by hook
      }
    },
    [editingCase, createMutation, updateMutation],
  );

  const handlePublish = useCallback(
    async (cs: CaseStudy) => {
      try {
        await publishMutation(cs.id);
      } catch {
        // Error handled by hook
      }
    },
    [publishMutation],
  );

  const handleUnpublish = useCallback(
    async (cs: CaseStudy) => {
      try {
        await unpublishMutation(cs.id);
      } catch {
        // Error handled by hook
      }
    },
    [unpublishMutation],
  );

  const handleDelete = useCallback(
    async (cs: CaseStudy) => {
      try {
        await deleteMutation(cs.id);
        setConfirmDelete(null);
      } catch {
        // Error handled by hook
      }
    },
    [deleteMutation],
  );

  const handleExportCsv = useCallback(() => {
    exportToCSV(filtered as unknown as Record<string, unknown>[], `case-studies-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'titleVi', header: 'Tiêu đề (VI)' },
      { key: 'titleEn', header: 'Tiêu đề (EN)' },
      { key: 'slug', header: 'Slug' },
      { key: 'outcome', header: 'Kết quả' },
      { key: 'published', header: 'Trạng thái' },
      { key: 'featured', header: 'Nổi bật' },
      { key: 'createdAt', header: 'Ngày tạo' },
    ]);
    notifySuccess(`Đã export ${filtered.length} case studies ra CSV`);
  }, [filtered]);

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending;

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Case Studies"
        subtitle={`Quản lý ${caseStudies.length} case studies`}
        actions={
          canWrite ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="action-btn"
                onClick={handleExportCsv}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                disabled={filtered.length === 0}
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={handleOpenCreate}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Tạo Case Study
              </button>
            </div>
          ) : null
        }
      />

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 12,
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
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem', marginLeft: 'auto' }}>
            Hiển thị {paginated.length} / {filtered.length}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--gray-200)' }}>
          {tabsWithCounts.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom:
                  statusFilter === tab.value
                    ? '2px solid var(--primary)'
                    : '2px solid transparent',
                color:
                  statusFilter === tab.value ? 'var(--primary)' : 'var(--gray-600)',
                fontWeight: statusFilter === tab.value ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginBottom: -1,
              }}
            >
              {tab.label}
              <span
                style={{
                  background:
                    statusFilter === tab.value ? 'var(--primary)' : 'var(--gray-100)',
                  color: statusFilter === tab.value ? 'white' : 'var(--gray-500)',
                  padding: '1px 6px',
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <CaseStudiesTable
          data={paginated}
          isLoading={isLoading}
          onEdit={canWrite ? handleOpenEdit : undefined}
          onDelete={canDelete ? (cs) => setConfirmDelete(cs) : undefined}
          onPublish={canPublish ? handlePublish : undefined}
          onUnpublish={canWrite ? handleUnpublish : undefined}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 12,
              fontSize: '0.82rem',
              color: 'var(--gray-500)',
            }}
          >
            <span>
              Trang {page} / {totalPages} · {filtered.length} case studies
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className="action-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Trước
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CaseStudyForm
        key={editingCase?.id ?? 'new'}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingCase(null);
        }}
        caseStudy={editingCase}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) handleDelete(confirmDelete);
        }}
        title="Xóa Case Study"
        message={
          confirmDelete
            ? `Bạn có chắc muốn xóa "${confirmDelete.titleVi}"? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ─── Inline Table Component ────────────────────────────────────────────────────

interface CaseStudiesTableProps {
  data: CaseStudy[];
  isLoading?: boolean;
  onEdit?: (cs: CaseStudy) => void;
  onDelete?: (cs: CaseStudy) => void;
  onPublish?: (cs: CaseStudy) => void;
  onUnpublish?: (cs: CaseStudy) => void;
}

function CaseStudiesTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
}: CaseStudiesTableProps) {
  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
        Đang tải...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
        Chưa có case study nào.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr
            style={{
              background: 'var(--gray-50)',
              borderBottom: '1px solid var(--gray-200)',
            }}
          >
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Tiêu đề</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Slug</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Kết quả</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Trạng thái</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Nổi bật</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Ngày tạo</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cs) => (
            <tr
              key={cs.id}
              style={{
                borderBottom: '1px solid var(--gray-100)',
                background: 'white',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--gray-50)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <td style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 600 }}>{cs.titleVi || cs.titleEn || '—'}</div>
                {cs.titleEn && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {cs.titleEn}
                  </div>
                )}
                {cs.thumbnailUrl && (
                  <img
                    src={cs.thumbnailUrl}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 4,
                      marginTop: 4,
                    }}
                  />
                )}
              </td>
              <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {cs.slug}
              </td>
              <td style={{ padding: '10px 12px', maxWidth: 200 }}>
                <div
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--gray-600)',
                  }}
                  title={cs.outcome}
                >
                  {cs.outcome || '—'}
                </div>
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                {cs.published ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      background: 'var(--success-bg, #D1FAE5)',
                      color: 'var(--success, #059669)',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <Globe size={10} /> Đã đăng
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      background: 'var(--gray-100)',
                      color: 'var(--gray-600)',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <GlobeLock size={10} /> Nháp
                  </span>
                )}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                {cs.featured ? (
                  <span
                    style={{
                      padding: '2px 8px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    ★ Nổi bật
                  </span>
                ) : null}
              </td>
              <td style={{ padding: '10px 12px', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                {cs.createdAt
                  ? new Intl.DateTimeFormat('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }).format(new Date(cs.createdAt))
                  : '—'}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  {cs.published && onUnpublish && (
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => onUnpublish(cs)}
                      title="Hủy đăng"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <GlobeLock size={12} />
                    </button>
                  )}
                  {!cs.published && onPublish && (
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => onPublish(cs)}
                      title="Xuất bản"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        color: 'var(--success, #059669)',
                      }}
                    >
                      <Globe size={12} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => onEdit(cs)}
                      title="Sửa"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => onDelete(cs)}
                      title="Xóa"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        color: '#DC2626',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
