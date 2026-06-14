'use client';

import { BackToTop } from './back-to-top';
import { CallWidget } from './call-widget';

export function FloatingWidgets() {
  return (
    <div className="floating-widgets" aria-label="Tiện ích nhanh">
      <BackToTop />
      <CallWidget />
    </div>
  );
}
