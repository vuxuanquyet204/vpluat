'use client';

import { LogIn } from 'lucide-react';
import { ConfirmDialog } from '@/features/admin/shared';
import type { AdminUser } from '@/features/admin/types';

interface ImpersonateDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ImpersonateDialog({ isOpen, user, onConfirm, onClose }: ImpersonateDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Đăng nhập thay người dùng"
      message={
        user
          ? `Bạn sẽ đăng nhập thay "${user.name}" (${user.email}). Mọi thao tác sẽ được ghi audit log với tên người bị impersonate. Bạn có thể thoát bất cứ lúc nào.`
          : ''
      }
      confirmLabel="Đăng nhập thay"
      cancelLabel="Hủy"
      variant="danger"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

void LogIn;