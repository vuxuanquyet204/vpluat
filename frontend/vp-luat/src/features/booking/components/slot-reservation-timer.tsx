'use client';

import { useEffect, useMemo, useState } from 'react';

export function SlotReservationTimer({
  expiresAt,
  onExpire,
}: {
  expiresAt: string | null;
  onExpire: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = useMemo(() => {
    if (!expiresAt) {
      return 0;
    }

    return Math.max(new Date(expiresAt).getTime() - now, 0);
  }, [expiresAt, now]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    if (remainingMs <= 0) {
      onExpire();
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt, onExpire, remainingMs]);

  if (!expiresAt) {
    return null;
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--warning-bg)] px-4 py-3 text-center text-[0.82rem] font-medium text-[var(--warning)]">
      Giữ lịch trong {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
