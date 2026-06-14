import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ variant = 'green', children, className = '', style }: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`} style={style}>
      {children}
    </span>
  );
}
