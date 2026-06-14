import type { ReactNode } from 'react';

interface RowUserProps {
  initials: string;
  name: string;
  sub?: string;
  className?: string;
}

export function RowUser({ initials, name, sub, className = '' }: RowUserProps) {
  return (
    <div className={`row-user ${className}`}>
      <div className="row-user__avatar" aria-hidden="true">
        {initials.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="row-user__name">{name}</div>
        {sub && <div className="row-user__sub">{sub}</div>}
      </div>
    </div>
  );
}
