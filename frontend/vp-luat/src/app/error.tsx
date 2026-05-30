'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry (only if available)
    // In production, add: import * as Sentry from '@sentry/nextjs';
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.error('[Error]', error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Đã xảy ra lỗi
        </h1>
        <p className="text-gray-600 mb-6">
          Chúng tôi đã ghi nhận lỗi này và sẽ khắc phục sớm nhất có thể.
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
          <Button onClick={() => (window.location.href = '/')}>
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
