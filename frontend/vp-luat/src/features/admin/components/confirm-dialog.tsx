'use client';

import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
  children?: ReactNode;
}

const ICONS = {
  danger: <XCircle size={20} strokeWidth={2} />,
  warning: <AlertTriangle size={20} strokeWidth={2} />,
  primary: <Info size={20} strokeWidth={2} />,
};

const ICON_COLORS = {
  danger: '#DC2626',
  warning: '#D97706',
  primary: '#2563EB',
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'primary',
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    },
    [onClose, isLoading],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        role="document"
      >
        <div className="modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: ICON_COLORS[variant] }} aria-hidden="true">
              {variant === 'primary' ? <CheckCircle2 size={20} /> : ICONS[variant]}
            </span>
            <h2 className="modal__title" style={{ margin: 0 }}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Đóng"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal__body">
          <p style={{ color: 'var(--gray-600)', margin: 0, lineHeight: 1.5 }}>{message}</p>
          {children}
        </div>
        <div className="modal__footer">
          <button
            type="button"
            className="action-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`action-btn ${variant === 'danger' ? 'action-btn--danger' : 'action-btn--primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
