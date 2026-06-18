'use client';

import { useEffect, useState } from 'react';
import { MockDB } from './db';
import { SEED_DATA } from './seed';

/**
 * MockDBProvider — component không render gì, chỉ khởi tạo MockDB + seed
 * localStorage lần đầu. Đặt trong admin layout.
 *
 * Trả về null ở lần render đầu (cả server và client đều giống nhau),
 * sau đó mount xong mới render children — tránh hydration mismatch vì
 * MockDB chỉ tồn tại ở client (localStorage).
 */
export function MockDBProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    MockDB.init(SEED_DATA);
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}
