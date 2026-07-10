'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffSidebar } from './staff-sidebar';
import { StaffTopbar } from './staff-topbar';
import { ErrorBoundary, SkeletonPage } from '@/features/admin/components';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { isStaffRole } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';

interface StaffLayoutProps {
  children: React.ReactNode;
}

function StaffShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <StaffSidebar />
      <div className="admin-main">
        <StaffTopbar />
        <main className="admin-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

function StaffRoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      const userRole = session?.user?.role as Role;

      // If user is ADMIN or SUPER_ADMIN, redirect to admin
      if (!isStaffRole(userRole)) {
        router.replace('/admin/dashboard');
        return;
      }

      setChecked(true);
    }
  }, [status, router, session]);

  if (status === 'loading' || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm text-gray-500">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SkeletonPage />}>
        <StaffRoleGuard>
          <StaffShell>{children}</StaffShell>
        </StaffRoleGuard>
      </Suspense>
    </ErrorBoundary>
  );
}
