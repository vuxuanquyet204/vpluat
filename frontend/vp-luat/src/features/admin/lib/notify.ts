/**
 * Toast/notify helper — dùng `sonner` (đã có trong package.json) làm lib dưới,
 * cộng với fallback ghi vào useAdminUIStore.notifications cho notification center.
 */

'use client';

import { toast as sonnerToast } from 'sonner';
import { useAdminUIStore } from '../store/admin-ui.store';

type NotifyType = 'success' | 'error' | 'warning' | 'info';

const sonnerMap: Record<NotifyType, (msg: string) => void> = {
  success: sonnerToast.success,
  error: sonnerToast.error,
  warning: sonnerToast.warning,
  info: sonnerToast.info,
};

function notify(type: NotifyType, title: string, message?: string): void {
  const fullMessage = message ? `${title}: ${message}` : title;
  sonnerMap[type](fullMessage);
}

export const notifySuccess = (title: string, message?: string) => notify('success', title, message);
export const notifyError = (title: string, message?: string) => notify('error', title, message);
export const notifyWarning = (title: string, message?: string) => notify('warning', title, message);
export const notifyInfo = (title: string, message?: string) => notify('info', title, message);

/** Push notification vào notification center (topbar bell). */
export function pushInAppNotification(input: {
  type: 'lead_new' | 'booking_upcoming' | 'booking_cancelled' | 'review_new' | 'campaign_sent' | 'system';
  title: string;
  message: string;
  link?: string;
  icon?: string;
}): void {
  useAdminUIStore.getState().addNotification({
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    icon: input.icon ?? 'Bell',
    channels: ['in_app'],
    read: false,
    createdAt: new Date().toISOString(),
  });
}
