'use client';

import dynamic from 'next/dynamic';

const LandingPagesPage = dynamic(
  () => import('@/features/admin/pages/landing-pages').then((m) => m.default),
  { ssr: false, loading: () => <div style={{ padding: 32 }}>Đang tải...</div> },
);

export default function Page() {
  return <LandingPagesPage />;
}