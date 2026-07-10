'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, width = 520, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 99,
          animation: 'fadeIn 0.18s ease',
        }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width,
          maxWidth: '95vw',
          maxHeight: '90vh',
          background: 'white',
          borderRadius: 12,
          zIndex: 100,
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFade 0.18s ease',
        }}
      >
        {title && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div
          style={{
            padding: 20,
            overflow: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--gray-200)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              background: 'var(--gray-50)',
              borderRadius: '0 0 12px 12px',
            }}
          >
            {footer}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalFade {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number | string;
}

export function Drawer({ open, onClose, title, children, width = 480 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 99,
          animation: 'fadeIn 0.18s ease',
        }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width,
          maxWidth: '95vw',
          background: 'white',
          zIndex: 100,
          boxShadow: '-12px 0 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerSlide 0.22s ease',
        }}
      >
        {title && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div
          style={{
            padding: 20,
            overflow: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={420}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--gray-200)',
              background: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: variant === 'danger' ? '#DC2626' : 'var(--primary, #1E3A5F)',
              color: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
        {message}
      </p>
    </Modal>
  );
}