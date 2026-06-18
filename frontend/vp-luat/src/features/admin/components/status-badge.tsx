'use client';

import { Badge } from '../shared/components/badge';

export type StatusVariant = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  icon?: React.ReactNode;
}

export function StatusBadge({ label, variant = 'gray', icon }: StatusBadgeProps) {
  const map: Record<StatusVariant, 'green' | 'yellow' | 'red' | 'blue' | 'purple'> = {
    green: 'green',
    yellow: 'yellow',
    red: 'red',
    blue: 'blue',
    purple: 'purple',
    gray: 'blue',
  };
  return (
    <Badge variant={map[variant]}>
      {icon}
      {label}
    </Badge>
  );
}
