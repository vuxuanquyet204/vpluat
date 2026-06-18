'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { notifyInfo } from '@/features/admin/lib';

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt', flag: 'VN' },
  { value: 'en', label: 'English', flag: 'EN' },
];

const STORAGE_KEY = 'vp-luat-admin-language';

export function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('vi');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setLang(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (value: string, label: string) => {
    setLang(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, value);
    notifyInfo('Đã đổi ngôn ngữ', `Hiển thị: ${label} (mock — sẽ áp dụng i18n đầy đủ sau)`);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Đổi ngôn ngữ"
        aria-expanded={open}
        title={`Ngôn ngữ: ${current.label}`}
        className="admin-topbar__icon-btn"
      >
        <Globe size={16} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 220,
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'langFade 0.18s ease',
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--gray-200)',
                background: 'var(--gray-50)',
                fontSize: '0.7rem',
                color: 'var(--gray-500)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Ngôn ngữ / Language
            </div>

            <div style={{ padding: 4 }}>
              {LANGUAGES.map((l) => {
                const active = l.value === lang;
                return (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => handleSelect(l.value, l.label)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      background: active ? 'var(--primary-faint, #EFF3F8)' : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = 'var(--gray-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = active
                        ? 'var(--primary-faint, #EFF3F8)'
                        : 'transparent';
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 22,
                        borderRadius: 4,
                        background: l.value === 'vi' ? '#DC2626' : '#1B4D8C',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {l.flag}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: active ? 700 : 500,
                          color: 'var(--gray-800)',
                        }}
                      >
                        {l.label}
                      </div>
                    </div>
                    {active && <Check size={14} color="var(--primary)" />}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                padding: '6px 12px',
                background: 'var(--gray-50)',
                borderTop: '1px solid var(--gray-200)',
                fontSize: '0.65rem',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ChevronDown size={10} />
              Mock i18n — ghi nhớ vào localStorage
              <style jsx global>{`
                @keyframes langFade {
                  from { opacity: 0; transform: translateY(-4px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          </div>
        </>
      )}
    </div>
  );
}