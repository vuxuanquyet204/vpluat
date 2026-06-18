'use client';

import { useState } from 'react';
import { History, RotateCcw, Eye } from 'lucide-react';
import { Modal } from '@/features/admin/shared';
import type { PostRevision } from '@/features/admin/types';

interface PostRevisionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: PostRevision[];
  onRestore: (revision: PostRevision) => void;
  onPreview?: (revision: PostRevision) => void;
}

export function PostRevisionHistory({
  isOpen,
  onClose,
  revisions,
  onRestore,
}: PostRevisionHistoryProps) {
  const [preview, setPreview] = useState<PostRevision | null>(null);

  const sorted = [...revisions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Lịch sử chỉnh sửa"
        size="md"
        footer={
          <button type="button" className="action-btn action-btn--primary" onClick={onClose}>
            Đóng
          </button>
        }
      >
        {sorted.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--gray-500)',
            }}
          >
            <History size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Chưa có bản sửa đổi nào</div>
            <div style={{ fontSize: '0.82rem' }}>
              Mỗi lần bạn lưu bài viết, hệ thống sẽ tạo một bản snapshot để khôi phục sau này.
            </div>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 480, overflowY: 'auto' }}>
            {sorted.map((r, idx) => (
              <li
                key={r.id}
                style={{
                  padding: '10px 0',
                  borderBottom: idx < sorted.length - 1 ? '1px solid var(--gray-200)' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: idx === 0 ? 'var(--accent, #C9A84C)' : 'var(--gray-300)',
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)', marginTop: 2 }}>
                    {r.author} ·{' '}
                    {new Intl.DateTimeFormat('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(r.createdAt))}
                    {r.reason ? ` · ${r.reason}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="action-btn"
                    style={{ padding: '4px 8px' }}
                    onClick={() => setPreview(r)}
                    title="Xem nội dung"
                    aria-label="Xem nội dung revision"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    style={{ padding: '4px 8px' }}
                    onClick={() => onRestore(r)}
                    title="Khôi phục"
                    aria-label="Khôi phục revision này"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview ? `Snapshot: ${preview.title}` : ''}
        size="lg"
        footer={
          <button type="button" className="action-btn action-btn--primary" onClick={() => setPreview(null)}>
            Đóng
          </button>
        }
      >
        {preview && (
          <div
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                color: 'var(--gray-500)',
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Tác giả: {preview.author}</span>
              <span>
                {new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(preview.createdAt))}
              </span>
            </div>
            <article
              className="pe-preview__content"
              dangerouslySetInnerHTML={{ __html: preview.content }}
            />
          </div>
        )}
      </Modal>
    </>
  );
}
