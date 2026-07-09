'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  CalendarDays,
  UserPlus,
  TrendingUp,
  MessagesSquare,
  Star,
  CheckCircle2,
  CircleDot,
  Users,
  Newspaper,
  BarChart3,
} from 'lucide-react';
import { RoleDisplayNames, canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import Link from 'next/link';

function StatCard({
  icon,
  iconVariant,
  value,
  label,
  href
}: {
  icon: React.ReactNode;
  iconVariant: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'cyan';
  value: string | number;
  label: string;
  href?: string;
}) {
  const content = (
    <div className="stat-card" style={{ cursor: href ? 'pointer' : 'default' }}>
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${iconVariant}`}>{icon}</div>
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickActionCard({
  icon: Icon,
  label,
  href,
  bg,
  color
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  bg: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="quick-action"
      style={{ textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}
    >
      <div className="quick-action__icon" style={{ background: bg, color }}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <span className="quick-action__label" style={{ fontSize: '0.8rem' }}>{label}</span>
    </Link>
  );
}

export default function StaffDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';
  const userName = session?.user?.name ?? session?.user?.fullName ?? 'Nhân viên';
  const roleDisplayName = RoleDisplayNames[userRole] ?? 'Nhân viên';

  const quickActions = useMemo(() => {
    const actions = [];

    if (canAccessNav(userRole, 'crm')) {
      actions.push({
        icon: UserPlus,
        label: 'Quản lý Lead',
        href: '/staff/crm',
        bg: '#FEF9EF',
        color: '#C9A84C'
      });
    }

    if (canAccessNav(userRole, 'bookings')) {
      actions.push({
        icon: CalendarDays,
        label: 'Lịch hẹn',
        href: '/staff/bookings',
        bg: '#ECFDF5',
        color: '#059669'
      });
    }

    if (canAccessNav(userRole, 'reviews')) {
      actions.push({
        icon: Star,
        label: 'Đánh giá',
        href: '/staff/reviews',
        bg: '#FEF3C7',
        color: '#F59E0B'
      });
    }

    if (canAccessNav(userRole, 'blog')) {
      actions.push({
        icon: Newspaper,
        label: 'Bài viết',
        href: '/staff/blog',
        bg: '#EFF3F8',
        color: '#1E3A5F'
      });
    }

    if (canAccessNav(userRole, 'landing-pages')) {
      actions.push({
        icon: BarChart3,
        label: 'Landing Pages',
        href: '/staff/landing-pages',
        bg: '#EFF6FF',
        color: '#2563EB'
      });
    }

    return actions;
  }, [userRole]);

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">
            Xin chào, {userName.split(' ')[0]}!
          </h1>
          <p className="admin-page-header__sub">
            {roleDisplayName} — Chúc bạn một ngày làm việc hiệu quả
          </p>
        </div>
        <div style={{
          padding: '6px 14px',
          background: 'var(--primary-faint, #EFF3F8)',
          color: 'var(--primary, #1E3A5F)',
          borderRadius: 20,
          fontSize: '0.78rem',
          fontWeight: 600
        }}>
          {roleDisplayName}
        </div>
      </div>

      <div className="stats-grid">
        {canAccessNav(userRole, 'crm') && (
          <>
            <StatCard
              icon={<UserPlus size={18} strokeWidth={2.2} />}
              iconVariant="green"
              value="24"
              label="Lead mới tuần này"
              href="/staff/crm"
            />
            <StatCard
              icon={<TrendingUp size={18} strokeWidth={2.2} />}
              iconVariant="yellow"
              value="68%"
              label="Tỷ lệ phản hồi"
            />
          </>
        )}

        {canAccessNav(userRole, 'bookings') && (
          <>
            <StatCard
              icon={<CalendarDays size={18} strokeWidth={2.2} />}
              iconVariant="blue"
              value="5"
              label="Lịch hẹn hôm nay"
              href="/staff/bookings"
            />
            <StatCard
              icon={<CircleDot size={18} strokeWidth={2.2} />}
              iconVariant="purple"
              value="2"
              label="Chờ xác nhận"
              href="/staff/bookings"
            />
          </>
        )}

        {canAccessNav(userRole, 'reviews') && (
          <StatCard
            icon={<Star size={18} strokeWidth={2.2} />}
            iconVariant="yellow"
            value="12"
            label="Review chờ duyệt"
            href="/staff/reviews"
          />
        )}

        {canAccessNav(userRole, 'blog') && (
          <>
            <StatCard
              icon={<Newspaper size={18} strokeWidth={2.2} />}
              iconVariant="cyan"
              value="8"
              label="Bài viết draft"
              href="/staff/blog"
            />
            <StatCard
              icon={<CheckCircle2 size={18} strokeWidth={2.2} />}
              iconVariant="green"
              value="45"
              label="Bài đã xuất bản"
            />
          </>
        )}
      </div>

      {canAccessNav(userRole, 'bookings') && (
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 10,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CalendarDays size={16} />
            Lịch hẹn hôm nay
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--success-faint, #D1FAE5)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success, #10B981)' }}>3</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Hoàn tất</div>
            </div>
            <div style={{ padding: 12, background: 'var(--primary-faint, #EFF3F8)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary, #1E3A5F)' }}>2</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Đã xác nhận</div>
            </div>
            <div style={{ padding: 12, background: 'var(--warning-faint, #FEF3C7)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning, #B45309)' }}>2</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Chờ xác nhận</div>
            </div>
            <div style={{ padding: 12, background: 'var(--danger-faint, #FEE2E2)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger, #DC2626)' }}>0</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Đã hủy</div>
            </div>
          </div>
        </div>
      )}

      {canAccessNav(userRole, 'crm') && (
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 10,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} />
              Lead Pipeline
            </div>
            <Link href="/staff/crm" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
              Xem chi tiết →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ padding: 12, background: '#EFF6FF', borderRadius: 8, textAlign: 'center', borderLeft: '3px solid #2563EB' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB' }}>12</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Mới</div>
            </div>
            <div style={{ padding: 12, background: '#FEF9EF', borderRadius: 8, textAlign: 'center', borderLeft: '3px solid #D97706' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706' }}>8</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Đã liên hệ</div>
            </div>
            <div style={{ padding: 12, background: '#F3E8FF', borderRadius: 8, textAlign: 'center', borderLeft: '3px solid #7C3AED' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7C3AED' }}>5</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Đang tư vấn</div>
            </div>
            <div style={{ padding: 12, background: '#ECFDF5', borderRadius: 8, textAlign: 'center', borderLeft: '3px solid #059669' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>3</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Đã chuyển đổi</div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">Thao tác nhanh</div>
        </div>
        <div className="quick-actions">
          {quickActions.map((qa) => (
            <QuickActionCard key={qa.href} {...qa} />
          ))}
        </div>
      </div>
    </div>
  );
}
