'use client';

import {
  Briefcase,
  Building2,
  CalendarDays,
  CircleHelp,
  FileText,
  Gavel,
  Globe,
  Landmark,
  Lightbulb,
  Phone,
  ShieldCheck,
  Users,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  building: Building2,
  gavel: Gavel,
  'file-text': FileText,
  landmark: Landmark,
  users: Users,
  globe: Globe,
  lightbulb: Lightbulb,
  'circle-help': CircleHelp,
  briefcase: Briefcase,
  calendar: CalendarDays,
  shield: ShieldCheck,
  phone: Phone,
  video: Video,
};

export function BookingIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Briefcase;
  return <Icon className={className} />;
}
