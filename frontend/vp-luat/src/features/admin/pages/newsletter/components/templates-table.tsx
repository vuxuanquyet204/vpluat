'use client';

import { useMemo } from 'react';
import { FileText, Star, Pencil, Trash2, Copy } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge } from '@/features/admin/shared';
import type { NewsletterTemplate } from '@/features/admin/types';

interface TemplatesTableProps {
  data: NewsletterTemplate[];
  isLoading?: boolean;
  onEdit: (t: NewsletterTemplate) => void;
  onDelete: (t: NewsletterTemplate) => void;
  onDuplicate: (t: NewsletterTemplate) => void;
  canWrite: boolean;
  canDelete: boolean;
}

export function TemplatesTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onDuplicate,
  canWrite,
  canDelete,
}: TemplatesTableProps) {
  const columns: DataTableColumn<NewsletterTemplate>[] = [
    {
      key: 'name',
      header: 'Tên template',
      cell: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--primary-faint, #EFF3F8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <FileText size={14} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.85rem' }}>
              {t.name}
            </div>
            {t.description && (
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--gray-500)',
                  maxWidth: 280,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={t.description}
              >
                {t.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject mặc định',
      cell: (t) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>{t.subject}</span>
      ),
    },
    {
      key: 'body',
      header: 'Body preview',
      cell: (t) => (
        <code
          style={{
            fontSize: '0.7rem',
            color: 'var(--gray-500)',
            background: 'var(--gray-50)',
            padding: '2px 6px',
            borderRadius: 3,
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block',
          }}
          title={t.body}
        >
          {t.body}
        </code>
      ),
    },
    {
      key: 'isDefault',
      header: 'Mặc định',
      width: 110,
      cell: (t) =>
        t.isDefault ? (
          <StatusBadge variant="green" label="Mặc định" icon={<Star size={10} />} />
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      width: 110,
      cell: (t) => (
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
          {new Date(t.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 100,
      cell: (t) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 6px' }}
            title="Nhân bản"
            onClick={() => onDuplicate(t)}
          >
            <Copy size={11} />
          </button>
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Sửa"
              onClick={() => onEdit(t)}
            >
              <Pencil size={11} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xóa"
              onClick={() => onDelete(t)}
            >
              <Trash2 size={11} color="var(--danger, #DC2626)" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTableV2<NewsletterTemplate>
      columns={columns}
      data={data}
      isLoading={isLoading}
      rowKey={(t) => t.id}
      emptyTitle="Chưa có template"
      emptyDescription="Tạo template để dùng lại cho nhiều campaign."
    />
  );
}

void useMemo;