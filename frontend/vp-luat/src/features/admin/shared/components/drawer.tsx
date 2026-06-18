'use client';

import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 480,
}: DrawerProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width,
          maxWidth: '100%',
          height: '100%',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
        }}
      >
        {title && (
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>{children}</div>

        {footer && (
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--gray-200)',
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}