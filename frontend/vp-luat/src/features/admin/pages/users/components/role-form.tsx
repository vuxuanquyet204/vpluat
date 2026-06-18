'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { Modal } from '@/features/admin/shared';
import { FormFieldInput, FormFieldTextarea } from '@/features/admin/components';
import { roleFormSchema, type RoleFormValues } from '@/features/admin/schema';
import { ALL_PERMISSIONS } from '@/features/admin/types';
import type { Role } from '@/features/admin/types';

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => Promise<void> | void;
  initial: Role | null;
  isLoading?: boolean;
}

const DEFAULT: RoleFormValues = {
  name: '',
  description: '',
  permissions: [],
};

export function RoleForm({ isOpen, onClose, onSubmit, initial, isLoading }: RoleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: DEFAULT,
  });

  const selectedPerms = watch('permissions') ?? [];

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      reset({
        name: initial.name,
        description: initial.description ?? '',
        permissions: initial.permissions,
      });
    } else {
      reset(DEFAULT);
    }
  }, [isOpen, initial, reset]);

  const grouped = ALL_PERMISSIONS.reduce<Record<string, typeof ALL_PERMISSIONS>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {});

  const togglePerm = (key: string) => {
    const next = selectedPerms.includes(key)
      ? selectedPerms.filter((p) => p !== key)
      : [...selectedPerms, key];
    setValue('permissions', next, { shouldValidate: true });
  };

  const toggleGroup = (group: string) => {
    const groupKeys = grouped[group].map((p) => p.key as string);
    const allSelected = groupKeys.every((k) => selectedPerms.includes(k));
    const next = allSelected
      ? selectedPerms.filter((k) => !groupKeys.includes(k))
      : Array.from(new Set([...selectedPerms, ...groupKeys]));
    setValue('permissions', next, { shouldValidate: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? `Sửa — ${initial.name}` : 'Tạo role mới'}
      size="lg"
      footer={
        <>
          <button type="button" className="action-btn" onClick={onClose} disabled={isLoading}>
            <X size={12} /> Hủy
          </button>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Save size={12} /> {initial ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormFieldInput
            label="Tên role"
            required
            placeholder="VD: Editor, Marketing Manager"
            {...register('name')}
            error={errors.name?.message}
            disabled={initial?.isSystem}
          />
          <FormFieldTextarea
            label="Mô tả"
            rows={2}
            placeholder="Mô tả ngắn..."
            {...register('description')}
            error={errors.description?.message}
            disabled={initial?.isSystem}
          />

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <label style={labelStyle()}>
                Permissions <span style={{ color: 'var(--danger, #DC2626)' }}>*</span>
                <span style={{ color: 'var(--gray-500)', fontWeight: 400, marginLeft: 6 }}>
                  ({selectedPerms.length} / {ALL_PERMISSIONS.length})
                </span>
              </label>
              {initial?.isSystem && (
                <span style={{ fontSize: '0.72rem', color: 'var(--warning, #D97706)' }}>
                  ⚠ System role: sửa trong Permission Matrix
                </span>
              )}
            </div>
            <div
              style={{
                border: '1px solid var(--gray-200)',
                borderRadius: 6,
                maxHeight: 360,
                overflow: 'auto',
                padding: 8,
                background: 'var(--gray-50)',
              }}
            >
              {Object.entries(grouped).map(([group, perms]) => {
                const groupKeys = perms.map((p) => p.key);
                const allSelected = groupKeys.every((k) => selectedPerms.includes(k));
                const someSelected =
                  !allSelected && groupKeys.some((k) => selectedPerms.includes(k));
                return (
                  <div
                    key={group}
                    style={{
                      marginBottom: 6,
                      background: 'white',
                      borderRadius: 4,
                      padding: 8,
                      border: '1px solid var(--gray-200)',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={() => toggleGroup(group)}
                      />
                      {group} ({perms.length})
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 4,
                        marginTop: 6,
                      }}
                    >
                      {perms.map((p) => (
                        <label
                          key={p.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.72rem',
                            color: 'var(--gray-700)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(p.key)}
                            onChange={() => togglePerm(p.key)}
                          />
                          {p.label} <span style={{ color: 'var(--gray-400)' }}>({p.key})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.permissions?.message && (
              <div style={{ color: 'var(--danger, #DC2626)', fontSize: '0.72rem', marginTop: 4 }}>
                {errors.permissions.message}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

function labelStyle(): React.CSSProperties {
  return {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--gray-700)',
    marginBottom: 6,
  };
}