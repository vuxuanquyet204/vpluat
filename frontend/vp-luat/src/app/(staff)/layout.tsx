import { StaffLayout } from '@/features/staff/layout';

export default function StaffRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}