'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { Modal } from '@/features/admin/shared';
import { FormFieldInput } from '@/features/admin/components';
import { userFormSchema, type UserFormValues } from '@/features/admin/schema';
import type { AdminUser, UserRole } from '@/features/admin/types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  initial: AdminUser | null;
  isLoading?: boolean;
  hidePassword?: boolean;
}

const DEFAULT: UserFormValues = {
  name: '',
  email: '',
  role: 'staff',
  isActive: true,
  phone: '',
  password: '',
};

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'staff', label: 'Staff' },
];

export function UserForm({ isOpen, onClose, onSubmit, initial, isLoading, hidePassword }: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: DEFAULT,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      reset({
        name: initial.name,
        email: initial.email,
        role: initial.role,
        isActive: initial.isActive,
        phone: initial.phone ?? '',
        password: '',
      });
    } else {
      reset(DEFAULT);
    }
  }, [isOpen, initial, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? `Sửa — ${initial.name}` : 'Tạo người dùng mới'}
      size="md"
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
            label="Họ và tên"
            required
            placeholder="Nguyễn Văn A"
            {...register('name')}
            error={errors.name?.message}
          />
          <FormFieldInput
            label="Email"
            required
            type="email"
            placeholder="user@vpluat.vn"
            {...register('email')}
            error={errors.email?.message}
          />
          <FormFieldInput
            label="Số điện thoại"
            placeholder="028 1234 5678"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle()}>Vai trò</label>
              <select {...register('role')} className="action-btn" style={inputStyle()}>
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle()}>Trạng thái</label>
              <div style={{ padding: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                  <input type="checkbox" {...register('isActive')} /> Hoạt động
                </label>
              </div>
            </div>
          </div>
          {!hidePassword && (
            <FormFieldInput
              label="Mật khẩu (để trống = giữ nguyên)"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              {...register('password')}
              error={errors.password?.message}
            />
          )}
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
function inputStyle(): React.CSSProperties {
  return { width: '100%', padding: '8px 10px', fontSize: '0.85rem' };
}

