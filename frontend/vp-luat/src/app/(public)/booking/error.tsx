'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[var(--off-white)] px-4 py-16 text-[var(--primary)]">
      <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[var(--gray-100)] bg-white p-8 text-center shadow-[var(--shadow-md)]">
        <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-full bg-[var(--error-bg)] text-[var(--error)]">
          <AlertTriangle className="h-9 w-9" />
        </div>
        <h1 className="mb-3 font-heading text-4xl font-bold">Không thể tải trang đặt lịch</h1>
        <p className="mx-auto mb-6 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
          Đã có lỗi xảy ra khi khởi tạo luồng đặt lịch. Vui lòng thử lại hoặc quay về trang chủ nếu sự cố tiếp tục.
        </p>
        <p className="mb-8 rounded-[var(--radius-md)] bg-[var(--primary-faint)] px-4 py-3 text-left text-xs text-[var(--text-muted)]">
          {error.message}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--primary-dark)] transition hover:-translate-y-px hover:bg-[var(--accent-dark)]"
          >
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-faint)]"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </main>
  );
}
