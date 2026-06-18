'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, FileSpreadsheet, FileCode, Download, Loader2 } from 'lucide-react';
import { notifyInfo } from '@/features/admin/lib';

const REPORTS = [
  {
    id: 'leads-monthly',
    label: 'Báo cáo Lead tháng',
    desc: 'Tổng hợp leads, conversion rate, source',
    icon: <FileSpreadsheet size={13} />,
    formats: ['xlsx', 'csv', 'pdf'],
  },
  {
    id: 'bookings-monthly',
    label: 'Báo cáo Booking tháng',
    desc: 'Lịch hẹn, tỷ lệ confirm, doanh thu ước tính',
    icon: <FileSpreadsheet size={13} />,
    formats: ['xlsx', 'csv'],
  },
  {
    id: 'revenue-quarter',
    label: 'Báo cáo Doanh thu quý',
    desc: 'P&L summary, top dịch vụ, top luật sư',
    icon: <FileText size={13} />,
    formats: ['xlsx', 'pdf'],
  },
  {
    id: 'reviews-summary',
    label: 'Báo cáo Đánh giá',
    desc: 'Rating trung bình, phân bố, reviews mới',
    icon: <FileText size={13} />,
    formats: ['csv', 'pdf'],
  },
  {
    id: 'audit-export',
    label: 'Audit log tổng hợp',
    desc: 'Toàn bộ thao tác trong kỳ',
    icon: <FileCode size={13} />,
    formats: ['csv', 'json'],
  },
];

export function ReportsMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = (reportId: string, format: string, label: string) => {
    setLoading(`${reportId}-${format}`);
    // Mock: simulate API call
    setTimeout(() => {
      const filename = `${reportId}-${new Date().toISOString().slice(0, 10)}.${format}`;
      notifyInfo(
        'Đang chuẩn bị báo cáo',
        `${label} (.${format}) — file mock: ${filename}`,
      );
      setLoading(null);
      setOpen(false);
    }, 600);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="admin-topbar__btn admin-topbar__btn--primary"
        onClick={() => setOpen((p) => !p)}
        aria-label="Xuất báo cáo"
        aria-expanded={open}
      >
        <Download size={14} aria-hidden="true" />
        <span>Xuất báo cáo</span>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 360,
              maxHeight: 480,
              overflow: 'auto',
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              zIndex: 100,
              animation: 'reportsFade 0.18s ease',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--gray-200)',
                background: 'var(--gray-50)',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                Trung tâm báo cáo
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                Chọn báo cáo & định dạng xuất
              </div>
            </div>

            <div style={{ padding: 4 }}>
              {REPORTS.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: 'var(--primary-faint, #EFF3F8)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {r.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-800)' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>{r.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.formats.map((f) => {
                      const isLoading = loading === `${r.id}-${f}`;
                      return (
                        <button
                          key={f}
                          type="button"
                          disabled={loading !== null}
                          onClick={() => handleDownload(r.id, f, r.label)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            background: isLoading ? 'var(--primary)' : 'var(--white)',
                            color: isLoading ? 'white' : 'var(--gray-700)',
                            border: '1px solid var(--gray-200)',
                            borderRadius: 4,
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            textTransform: 'uppercase',
                          }}
                        >
                          {isLoading ? (
                            <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Download size={10} />
                          )}
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '8px 12px',
                background: 'var(--gray-50)',
                borderTop: '1px solid var(--gray-200)',
                fontSize: '0.65rem',
                color: 'var(--gray-500)',
                textAlign: 'center',
              }}
            >
              Mock — file sẽ tải về sau khi chuẩn bị
              <style jsx global>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
                @keyframes reportsFade {
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