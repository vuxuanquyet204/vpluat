'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { FormFieldTextarea, EmptyStateWithCta } from '@/features/admin/components';
import { leadNoteSchema, type LeadNoteFormValues } from '@/features/admin/schema';
import { useAddLeadNote } from '@/features/admin/lib';
import { notifyError, notifySuccess } from '@/features/admin/lib';
import { getCurrentUser } from '@/features/admin/lib';
import type { LeadNote } from '@/features/admin/types';

interface LeadNotesProps {
  leadId: string;
  notes: LeadNote[];
}

export function LeadNotes({ leadId, notes }: LeadNotesProps) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadNoteFormValues>({
    resolver: zodResolver(leadNoteSchema),
    defaultValues: { content: '' },
  });

  const addNoteMutation = useAddLeadNote();

  const handleAdd = handleSubmit(async (values) => {
    try {
      await addNoteMutation.mutateAsync({ id: leadId, note: values.content });
      notifySuccess('Đã thêm ghi chú');
      reset();
      setShowForm(false);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể thêm ghi chú');
    }
  });

  const sorted = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      {!showForm ? (
        <button
          type="button"
          className="action-btn action-btn--primary"
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}
        >
          <Plus size={12} />
          Thêm ghi chú
        </button>
      ) : (
        <form onSubmit={handleAdd} style={{ marginBottom: 12 }}>
          <FormFieldTextarea
            label=""
            rows={3}
            placeholder="Nội dung ghi chú..."
            {...register('content')}
            error={errors.content?.message}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" className="action-btn action-btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => { setShowForm(false); reset(); }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm ? (
        <EmptyStateWithCta
          title="Chưa có ghi chú"
          description="Thêm ghi chú để theo dõi chi tiết về lead."
        />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sorted.map((n) => (
            <li
              key={n.id}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md, 8px)',
                marginBottom: 8,
                background: 'var(--white)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 4 }}>
                  <strong style={{ color: 'var(--gray-700)' }}>{n.authorName}</strong> ·{' '}
                  {new Intl.DateTimeFormat('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  }).format(new Date(n.createdAt))}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>{n.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
