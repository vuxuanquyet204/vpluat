'use client';

import { useMemo } from 'react';
import {
  Pencil,
  Trash2,
  Eye,
  Check,
  X,
  Calendar,
  Image as ImageIcon,
  CheckSquare,
  Square,
} from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { BlogPost, Category, Tag, PostStatus } from '@/features/admin/types';

const STATUS_VARIANT: Record<PostStatus, StatusVariant> = {
  published: 'green',
  scheduled: 'yellow',
  draft: 'gray',
};

const STATUS_LABEL: Record<PostStatus, string> = {
  published: 'Đã đăng',
  scheduled: 'Lên lịch',
  draft: 'Nháp',
};

interface PostsTableProps {
  data: BlogPost[];
  isLoading?: boolean;
  categories: Category[];
  tags: Tag[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
  onPreview: (post: BlogPost) => void;
  onPublish?: (post: BlogPost) => void;
  onUnpublish?: (post: BlogPost) => void;
  canPublish: boolean;
  canDelete: boolean;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function PostsTable({
  data,
  isLoading,
  categories,
  tags,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onPreview,
  onPublish,
  onUnpublish,
  canPublish,
  canDelete,
}: PostsTableProps) {
  const categoryMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const tagMap = useMemo(() => {
    const m = new Map<string, Tag>();
    tags.forEach((t) => m.set(t.id, t));
    return m;
  }, [tags]);

  const allSelected = data.length > 0 && data.every((p) => selectedIds.includes(p.id));
  const someSelected = data.some((p) => selectedIds.includes(p.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) onSelectChange([]);
    else onSelectChange(data.map((p) => p.id));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((x) => x !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const columns: DataTableColumn<BlogPost>[] = [
    {
      key: 'select',
      header: '',
      width: 40,
      cell: (p) => (
        <button
          type="button"
          onClick={() => toggleOne(p.id)}
          className="action-btn"
          style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label={selectedIds.includes(p.id) ? 'Bỏ chọn' : 'Chọn'}
        >
          {selectedIds.includes(p.id) ? (
            <CheckSquare size={14} color="var(--primary)" />
          ) : (
            <Square size={14} color="var(--gray-400)" />
          )}
        </button>
      ),
    },
    {
      key: 'title',
      header: 'Bài viết',
      sortable: true,
      cell: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {p.thumbnail ? (
            <img
              src={p.thumbnail}
              alt={p.title}
              style={{
                width: 48,
                height: 36,
                objectFit: 'cover',
                borderRadius: 6,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 36,
                borderRadius: 6,
                background: 'var(--gray-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ImageIcon size={16} style={{ color: 'var(--gray-400)' }} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--primary)',
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 320,
              }}
              title={p.title}
            >
              {p.title}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--gray-400)',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 320,
              }}
            >
              /{p.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      cell: (p) => (
        <span style={{ color: 'var(--gray-600)', fontSize: '0.8rem' }}>
          {categoryMap.get(p.category) ?? p.category}
        </span>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      cell: (p) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
          {p.tags.length === 0 ? (
            <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>—</span>
          ) : (
            p.tags.slice(0, 2).map((tid) => {
              const t = tagMap.get(tid);
              if (!t) return null;
              return (
                <span
                  key={tid}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: t.color,
                    color: 'white',
                  }}
                >
                  {t.name}
                </span>
              );
            })
          )}
          {p.tags.length > 2 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>+{p.tags.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Tác giả',
      cell: (p) => <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{p.author}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (p) => <StatusBadge variant={STATUS_VARIANT[p.status]} label={STATUS_LABEL[p.status]} />,
    },
    {
      key: 'publishedAt',
      header: 'Ngày đăng',
      cell: (p) => (
        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
          {p.status === 'scheduled' && p.scheduledAt ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} />
              {formatDate(p.scheduledAt)}
            </span>
          ) : (
            formatDate(p.publishedAt ?? p.updatedAt)
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 160,
      cell: (p) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="Xem trước"
            onClick={() => onPreview(p)}
          >
            <Eye size={12} />
          </button>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="Sửa"
            onClick={() => onEdit(p)}
          >
            <Pencil size={12} />
          </button>
          {canPublish && p.status !== 'published' && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Xuất bản"
              onClick={() => onPublish?.(p)}
            >
              <Check size={12} color="var(--success, #059669)" />
            </button>
          )}
          {canPublish && p.status === 'published' && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Hủy đăng"
              onClick={() => onUnpublish?.(p)}
            >
              <X size={12} color="var(--warning, #D97706)" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Xóa"
              onClick={() => onDelete(p)}
            >
              <Trash2 size={12} color="var(--danger, #DC2626)" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {data.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            padding: '6px 10px',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-md, 6px)',
            fontSize: '0.78rem',
          }}
        >
          <button
            type="button"
            onClick={toggleAll}
            className="action-btn"
            style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          >
            {allSelected ? (
              <CheckSquare size={14} color="var(--primary)" />
            ) : someSelected ? (
              <CheckSquare size={14} color="var(--primary)" style={{ opacity: 0.5 }} />
            ) : (
              <Square size={14} color="var(--gray-400)" />
            )}
          </button>
          <span style={{ color: 'var(--gray-600)' }}>
            {selectedIds.length > 0
              ? `Đã chọn ${selectedIds.length} / ${data.length}`
              : `Chọn tất cả (${data.length})`}
          </span>
        </div>
      )}
      <DataTableV2<BlogPost>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        onRowClick={onEdit}
        emptyTitle="Chưa có bài viết nào"
        emptyDescription="Tạo bài viết đầu tiên để bắt đầu."
      />
    </div>
  );
}