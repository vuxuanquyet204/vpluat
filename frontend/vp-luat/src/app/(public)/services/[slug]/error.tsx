'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ServiceDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ServiceDetailError({ error, reset }: ServiceDetailErrorProps) {
  useEffect(() => {
    console.error('[ServiceDetailPage] render error:', error);
  }, [error]);

  return (
    <main className="service-detail">
      <div
        className="container"
        style={{
          padding: '6rem 0',
          textAlign: 'center',
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.1)',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <AlertTriangle size={32} aria-hidden />
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: 'var(--primary)',
            marginBottom: 12,
          }}
        >
          Đã xảy ra lỗi
        </h1>
        <p style={{ color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
          Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.
        </p>
        {error?.message && (
          <p
            style={{
              color: 'var(--gray-500)',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              opacity: 0.7,
              marginBottom: '1.5rem',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={reset}
            className="btn btn--primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={16} /> Thử lại
          </button>
          <Link
            href="/services"
            className="btn btn--outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <ArrowLeft size={16} /> Danh sách dịch vụ
          </Link>
        </div>
      </div>
    </main>
  );
}