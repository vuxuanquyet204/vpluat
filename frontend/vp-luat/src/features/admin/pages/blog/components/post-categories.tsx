'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, FolderOpen, FolderTree } from 'lucide-react';
import { DataTableV2, type DataTableColumn, FormFieldInput, FormFieldTextarea } from '@/features/admin/components';
import { Modal } from '@/features/admin/shared';
import { categorySchema, type CategoryFormValues } from '@/features/admin/schema';
import type { Category } from '@/features/admin/types';

interface PostCategoriesProps {
  categories: Category[];
  onCreate: (values: CategoryFormValues) => Promise<void> | void;
  onUpdate: (id: string, values: CategoryFormValues) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function PostCategories({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
}: PostCategoriesProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const columns: DataTableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Tên danh mục',
      sortable: true,
      cell: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={14} style={{ color: 'var(--accent, #C9A84C)' }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>/{c.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Mô tả',
      cell: (c) => (
        <span style={{ color: 'var(--gray-600)', fontSize: '0.82rem' }}>
          {c.description || '—'}
        </span>
      ),
    },
    {
      key: 'postCount',
      header: 'Số bài viết',
      sortable: true,
      align: 'right',
      cell: (c) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: 'var(--gray-100)',
            borderRadius: 999,
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          {c.postCount}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      cell: (c) => (
        <div
          style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            onClick={() => {
              setEditing(c);
              setFormOpen(true);
            }}
            title="Sửa"
            aria-label="Sửa danh mục"
          >
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            className="action-btn action-btn--danger"
            style={{ padding: '4px 8px' }}
            onClick={() => setConfirmDelete(c)}
            title="Xóa"
            aria-label="Xóa danh mục"
            disabled={c.postCount > 0}
            aria-disabled={c.postCount > 0}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-card">
      <div
        className="admin-card__header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div className="admin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderTree size={16} /> Danh mục bài viết
        </div>
        <button
          type="button"
          className="action-btn action-btn--primary"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={14} /> Thêm danh mục
        </button>
      </div>

      <DataTableV2<Category>
        data={categories}
        columns={columns}
        defaultSort={{ by: 'name', dir: 'asc' }}
        emptyTitle="Chưa có danh mục nào"
        emptyDescription="Tạo danh mục để phân loại bài viết (vd: FDI, HĐĐT, Doanh nghiệp...)."
      />

      <CategoryForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={async (values) => {
          if (editing) {
            await onUpdate(editing.id, values);
          } else {
            await onCreate(values);
          }
          setFormOpen(false);
          setEditing(null);
        }}
        isLoading={isCreating || isUpdating}
      />

      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Xóa danh mục"
        size="sm"
        footer={
          <>
            <button type="button" className="action-btn" onClick={() => setConfirmDelete(null)}>
              Hủy
            </button>
            <button
              type="button"
              className="action-btn action-btn--danger"
              onClick={() => {
                if (confirmDelete) {
                  void onDelete(confirmDelete.id);
                  setConfirmDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </button>
          </>
        }
      >
        {confirmDelete && (
          <p style={{ margin: 0, color: 'var(--gray-700)' }}>
            Bạn có chắc muốn xóa danh mục <strong>{confirmDelete.name}</strong>? Hành động này không
            thể hoàn tác.
          </p>
        )}
      </Modal>
    </div>
  );
}

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  initial: Category | null;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  isLoading?: boolean;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function CategoryForm({ isOpen, onClose, initial, onSubmit, isLoading }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && initial) {
      reset({
        name: initial.name,
        slug: initial.slug,
        description: initial.description ?? '',
      });
    }
  }, [isOpen, initial, reset]);

  const name = watch('name');
  const slug = watch('slug');
  const slugTouched = Boolean(initial?.slug) || slug !== slugify(name);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Sửa danh mục' : 'Thêm danh mục mới'}
      size="sm"
      footer={
        <>
          <button type="button" className="action-btn" onClick={onClose} disabled={isLoading}>
            Hủy
          </button>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? 'Đang lưu...' : initial ? 'Cập nhật' : 'Tạo danh mục'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormFieldInput
          label="Tên danh mục"
          required
          placeholder="vd: FDI"
          {...register('name')}
          error={errors.name?.message}
        />
        <FormFieldInput
          label="Slug (URL)"
          required
          placeholder="fdi"
          value={slug}
          onChange={(e) => {
            const v = slugify(e.target.value);
            setValue('slug', v, { shouldValidate: true });
          }}
          error={errors.slug?.message}
          hint={!slugTouched ? 'Tự động tạo từ tên' : undefined}
        />
        <FormFieldTextarea
          label="Mô tả"
          rows={2}
          placeholder="Mô tả ngắn về danh mục..."
          {...register('description')}
          error={errors.description?.message}
        />
      </form>
    </Modal>
  );
}
