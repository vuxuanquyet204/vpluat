'use client';

import Link from 'next/link';

export function ChatHandoffBanner() {
  return (
    <div className="handoff-banner" role="region" aria-label="Kết nối tư vấn viên">
      <span className="handoff-banner__dot" aria-hidden="true" />
      <span className="handoff-banner__text">
        Tư vấn viên đang trực tuyến
      </span>
      <Link href="/booking" className="handoff-banner__btn">
        Kết nối tư vấn viên
      </Link>
    </div>
  );
}
