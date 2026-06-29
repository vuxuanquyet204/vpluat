'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { MockDBProvider } from '../mock/provider';
import { useBookingUpcomingAlerts } from '../pages/notifications/lib/use-booking-upcoming-alerts';
import { ErrorBoundary, SkeletonPage } from '../components';
import { useSession, signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

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

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      setChecked(true);
    }
  }, [status, router]);

  if (status === 'loading' || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm text-gray-500">Dang xac thuc...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useBookingUpcomingAlerts();
  return (
    <MockDBProvider>
      <ErrorBoundary>
        <Suspense fallback={<SkeletonPage />}>
          <AuthGuard>
            <AdminShell>{children}</AdminShell>
          </AuthGuard>
        </Suspense>
      </ErrorBoundary>
    </MockDBProvider>
  );
}
