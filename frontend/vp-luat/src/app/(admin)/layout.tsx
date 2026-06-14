import { AdminLayout } from '@/features/admin/layout';

export default function AdminRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
