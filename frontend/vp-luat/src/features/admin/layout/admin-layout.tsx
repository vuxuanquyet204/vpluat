'use client';

import { Suspense } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { MockDBProvider } from '../mock/provider';
import { useBookingUpcomingAlerts } from '../pages/notifications/lib/use-booking-upcoming-alerts';
import { ErrorBoundary, SkeletonPage } from '../components';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <main className="admin-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useBookingUpcomingAlerts();
  return (
    <MockDBProvider>
      <ErrorBoundary>
        <Suspense fallback={<SkeletonPage />}>
          <AdminShell>{children}</AdminShell>
        </Suspense>
      </ErrorBoundary>
    </MockDBProvider>
  );
}
