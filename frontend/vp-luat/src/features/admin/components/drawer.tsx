'use client';

import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Drawer({ isOpen, onClose, title, children, footer, width = 480 }: DrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
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
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <aside
        className="drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width,
          maxWidth: '95vw',
          background: 'var(--white)',
          boxShadow: '-10px 0 30px rgb(15 23 42 / 0.12)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease',
        }}
        role="document"
      >
        {title !== undefined && (
          <div
            className="drawer__header"
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 className="modal__title" style={{ margin: 0, fontSize: '1rem' }}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="modal__close"
            >
              <X size={16} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        )}

        <div
          className="drawer__body"
          style={{ flex: 1, overflow: 'auto', padding: 20 }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="drawer__footer"
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--gray-200)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </aside>

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
