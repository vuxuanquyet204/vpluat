'use client';

export type BookingAnalyticsEvent =
  | { type: 'booking_started' }
  | { type: 'booking_service_selected'; serviceSlug: string; serviceId: string }
  | { type: 'booking_lawyer_selected'; lawyerId: string; lawyerName: string }
  | { type: 'booking_date_selected'; date: string }
  | { type: 'booking_slot_reserved'; slotId: string; startTime: string }
  | { type: 'booking_slot_conflict'; slotId: string }
  | { type: 'booking_reservation_expired'; reservationId: string }
  | { type: 'booking_step_completed'; step: string }
  | { type: 'booking_submit_started' }
  | { type: 'booking_submit_succeeded'; bookingId: string }
  | { type: 'booking_submit_failed'; errorCode: string };

export type BookingAnalyticsMeta = {
  serviceSlug?: string;
  serviceId?: string;
  lawyerId?: string;
  date?: string;
  slotId?: string;
  step?: string;
  errorCode?: string;
};

function buildMeta(event: BookingAnalyticsEvent): BookingAnalyticsMeta {
  switch (event.type) {
    case 'booking_started':
      return {};
    case 'booking_service_selected':
      return { serviceSlug: event.serviceSlug, serviceId: event.serviceId };
    case 'booking_lawyer_selected':
      return { lawyerId: event.lawyerId };
    case 'booking_date_selected':
      return { date: event.date };
    case 'booking_slot_reserved':
    case 'booking_slot_conflict':
      return { slotId: event.slotId };
    case 'booking_reservation_expired':
      return {};
    case 'booking_step_completed':
      return { step: event.step };
    case 'booking_submit_started':
      return {};
    case 'booking_submit_succeeded':
      return {};
    case 'booking_submit_failed':
      return { errorCode: event.errorCode };
  }
}

export function trackBookingEvent(event: BookingAnalyticsEvent) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[BookingAnalytics]', event.type, buildMeta(event));
    return;
  }

  // Placeholder: wire to GA4, PostHog, or any analytics provider.
  // The shape is safe metadata only — no PII.
  const payload = {
    event: event.type,
    ...buildMeta(event),
    timestamp: new Date().toISOString(),
  };

  // Example integrations (uncomment and configure as needed):
  // window.gtag?.('event', event.type, buildMeta(event));
  // posthog.capture(event.type, buildMeta(event));

  void payload; // suppress unused warning until connected
}

export function trackBookingStarted() {
  trackBookingEvent({ type: 'booking_started' });
}

export function trackBookingServiceSelected(serviceSlug: string, serviceId: string) {
  trackBookingEvent({ type: 'booking_service_selected', serviceSlug, serviceId });
}

export function trackBookingLawyerSelected(lawyerId: string, lawyerName: string) {
  trackBookingEvent({ type: 'booking_lawyer_selected', lawyerId, lawyerName });
}

export function trackBookingDateSelected(date: string) {
  trackBookingEvent({ type: 'booking_date_selected', date });
}

export function trackBookingSlotReserved(slotId: string, startTime: string) {
  trackBookingEvent({ type: 'booking_slot_reserved', slotId, startTime });
}

export function trackBookingSlotConflict(slotId: string) {
  trackBookingEvent({ type: 'booking_slot_conflict', slotId });
}

export function trackBookingReservationExpired(reservationId: string) {
  trackBookingEvent({ type: 'booking_reservation_expired', reservationId });
}

export function trackBookingStepCompleted(step: string) {
  trackBookingEvent({ type: 'booking_step_completed', step });
}

export function trackBookingSubmitStarted() {
  trackBookingEvent({ type: 'booking_submit_started' });
}

export function trackBookingSubmitSucceeded(bookingId: string) {
  trackBookingEvent({ type: 'booking_submit_succeeded', bookingId });
}

export function trackBookingSubmitFailed(errorCode: string) {
  trackBookingEvent({ type: 'booking_submit_failed', errorCode });
}
