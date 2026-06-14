import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`} role="status">
      {icon && <div className="empty-state__icon" aria-hidden="true">{icon}</div>}
      <div className="empty-state__title">{title}</div>
      {description && <div className="empty-state__desc">{description}</div>}
      {action && (
        <button
          type="button"
          className="action-btn action-btn--primary"
          onClick={action.onClick}
          style={{ marginTop: '12px' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
