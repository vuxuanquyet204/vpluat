'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, ExternalLink, Copy, Trophy } from 'lucide-react';
import { Modal, ConfirmDialog, StatusBadge, type StatusVariant } from '@/features/admin/shared';
import { useLandingPages, useCreateVariant, useDeleteLandingPage } from '../hooks/use-landing-pages';
import type { LandingPage, LandingPageStatus } from '@/features/admin/types';

interface LandingPageVariantsProps {
  isOpen: boolean;
  onClose: () => void;
  parentPage: LandingPage;
  onOpenVariant: (id: string) => void;
}

const STATUS_VARIANT: Record<LandingPageStatus, StatusVariant> = {
  draft: 'yellow',
  published: 'green',
  archived: 'gray',
};

export function LandingPageVariants({
  isOpen,
  onClose,
  parentPage,
  onOpenVariant,
}: LandingPageVariantsProps) {
  const { data: allPages = [] } = useLandingPages();
  const createVariant = useCreateVariant();
  const removePage = useDeleteLandingPage();
  const [confirmDelete, setConfirmDelete] = useState<LandingPage | null>(null);

  const variants = allPages.filter(
    (p) => p.parentPageId === parentPage.id || p.id === parentPage.id,
  );

  const handleCreate = async () => {
    const id = await createVariant(parentPage.id);
    if (id) onOpenVariant(id);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`A/B Variants — ${parentPage.title}`}
        size="lg"
        footer={
          <>
            <button type="button" className="action-btn" onClick={onClose}>
              Đóng
            </button>
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={handleCreate}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={12} /> Tạo Variant B
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              padding: 8,
              background: 'var(--blue-faint, #DBEAFE)',
              borderRadius: 6,
              fontSize: '0.78rem',
              color: 'var(--blue, #2563EB)',
            }}
          >
            Mỗi variant nhận 50% traffic. Hệ thống tự động đánh dấu variant có CTR cao nhất là winner.
          </div>

          {variants.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)' }}>
              Chưa có variant nào
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {variants.map((v) => {
                const isOriginal = v.id === parentPage.id;
                const isWinner =
                  variants.length > 1 &&
                  (v.analytics?.ctr ?? 0) === Math.max(...variants.map((x) => x.analytics?.ctr ?? 0));
                return (
                  <div
                    key={v.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 100px 100px auto',
                      gap: 8,
                      alignItems: 'center',
                      padding: 10,
                      background: isWinner ? 'var(--success-faint, #D1FAE5)' : 'var(--gray-50)',
                      border: isWinner
                        ? '1.5px solid var(--success, #10B981)'
                        : '1px solid var(--gray-200)',
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        <span
                          style={{
                            padding: '2px 8px',
                            background: isOriginal ? 'var(--primary)' : 'var(--blue, #2563EB)',
                            color: 'white',
                            borderRadius: 999,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {isOriginal ? 'A (gốc)' : `B`}
                        </span>
                        {v.title}
                        {isWinner && (
                          <span
                            style={{
                              padding: '2px 8px',
                              background: 'var(--success, #10B981)',
                              color: 'white',
                              borderRadius: 999,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Trophy size={10} /> Winner
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                        /{v.slug} · {v.blocks.length} blocks
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', textAlign: 'center' }}>
                      <div style={{ color: 'var(--gray-500)' }}>Views</div>
                      <div style={{ fontWeight: 700 }}>{(v.analytics?.views ?? 0).toLocaleString('vi-VN')}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', textAlign: 'center' }}>
                      <div style={{ color: 'var(--gray-500)' }}>Conv</div>
                      <div style={{ fontWeight: 700 }}>{(v.analytics?.conversions ?? 0).toLocaleString('vi-VN')}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', textAlign: 'center' }}>
                      <div style={{ color: 'var(--gray-500)' }}>CTR</div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {(v.analytics?.ctr ?? 0).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <StatusBadge variant={STATUS_VARIANT[v.status]} label={v.status} />
                      <button
                        type="button"
                        className="action-btn"
                        style={{ padding: '4px 6px' }}
                        title="Mở editor"
                        onClick={() => {
                          onOpenVariant(v.id);
                          onClose();
                        }}
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ padding: '4px 6px' }}
                        title="Xem trước"
                        onClick={() => window.open(`/lp/${v.slug}`, '_blank')}
                      >
                        <ExternalLink size={11} />
                      </button>
                      {!isOriginal && (
                        <button
                          type="button"
                          className="action-btn"
                          style={{ padding: '4px 6px' }}
                          title="Xóa"
                          onClick={() => setConfirmDelete(v)}
                        >
                          <Trash2 size={11} color="var(--danger, #DC2626)" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa variant"
        message={
          confirmDelete
            ? `Xóa variant "${confirmDelete.title}"? Hành động không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await removePage.mutateAsync(confirmDelete.id);
          } finally {
            setConfirmDelete(null);
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}