import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <div className={`admin-page-header ${className}`}>
      <div className="admin-page-header__left">
        <h1 className="admin-page-header__title">{title}</h1>
        {subtitle && (
          <p className="admin-page-header__sub">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="admin-page-header__actions">{actions}</div>
      )}
    </div>
  );
}
