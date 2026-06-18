/**
 * Auto-generate notifications từ các sự kiện nghiệp vụ.
 *
 * Wire point:
 *  - Lead mới từ CRM → pushInAppNotification('lead_new', ...)
 *  - Booking sắp diễn ra (<24h) → 'booking_upcoming' (gọi useBookingUpcomingAlerts ở topbar)
 *  - Booking cancelled → 'booking_cancelled'
 *  - Review mới (status=pending) → 'review_new'
 *  - Campaign gửi xong → 'campaign_sent'
 *
 * Lưu: hooks mutation ở CRM/Booking/Review/Newsletter import các helper bên dưới.
 */

import { pushInAppNotification } from '@/features/admin/lib';
import type { AdminNotification } from '@/features/admin/store';

export function notifyLeadCreated(leadName: string, source: string, leadId: string) {
  pushInAppNotification({
    type: 'lead_new',
    title: `Lead mới từ ${source}`,
    message: `${leadName} vừa đăng ký tư vấn`,
    link: `/admin/crm`,
  });
  void leadId;
}

export function notifyBookingUpcoming(
  customerName: string,
  date: string,
  time: string,
  bookingId: string,
) {
  pushInAppNotification({
    type: 'booking_upcoming',
    title: 'Booking sắp diễn ra',
    message: `${customerName} • ${date} ${time}`,
    link: `/admin/bookings`,
  });
  void bookingId;
}

export function notifyBookingCancelled(customerName: string, date: string) {
  pushInAppNotification({
    type: 'booking_cancelled',
    title: 'Booking bị huỷ',
    message: `${customerName} • ${date}`,
    link: `/admin/bookings`,
  });
}

export function notifyReviewCreated(authorName: string, rating: number, reviewId: string) {
  pushInAppNotification({
    type: 'review_new',
    title: `Review mới ${rating}★`,
    message: `${authorName} vừa để lại đánh giá`,
    link: `/admin/reviews`,
  });
  void reviewId;
}

export function notifyCampaignSent(campaignName: string, recipientCount: number) {
  pushInAppNotification({
    type: 'campaign_sent',
    title: 'Campaign đã gửi',
    message: `${campaignName} • ${recipientCount} người nhận`,
    link: `/admin/newsletter`,
  });
}

export function notifySystem(title: string, message: string, link?: string) {
  pushInAppNotification({ type: 'system', title, message, link });
}

// Re-export type để dùng ở notifications page
export type { AdminNotification };
export { pushInAppNotification };