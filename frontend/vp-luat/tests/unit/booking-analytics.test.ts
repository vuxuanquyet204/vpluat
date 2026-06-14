import { describe, expect, it, vi } from 'vitest';
import {
  trackBookingStarted,
  trackBookingServiceSelected,
  trackBookingLawyerSelected,
  trackBookingDateSelected,
  trackBookingSlotReserved,
  trackBookingSlotConflict,
  trackBookingReservationExpired,
  trackBookingStepCompleted,
  trackBookingSubmitStarted,
  trackBookingSubmitSucceeded,
  trackBookingSubmitFailed,
} from '@/features/booking/analytics';

describe('booking analytics', () => {
  it('tracks booking_started event', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingStarted();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_started',
      {},
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_service_selected with service metadata', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingServiceSelected('doanh-nghiep', 'service-doanh-nghiep');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_service_selected',
      { serviceId: 'service-doanh-nghiep', serviceSlug: 'doanh-nghiep' },
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_lawyer_selected with lawyer metadata', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingLawyerSelected('lawyer-nguyen-van-hung', 'Ls. Nguyễn Văn Hùng');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_lawyer_selected',
      { lawyerId: 'lawyer-nguyen-van-hung' },
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_date_selected with date metadata', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingDateSelected('2026-06-10');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_date_selected',
      { date: '2026-06-10' },
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_slot_reserved with slot metadata', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingSlotReserved('2026-06-10-08:30', '08:30');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_slot_reserved',
      { slotId: '2026-06-10-08:30' },
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_slot_conflict with slot metadata', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingSlotConflict('2026-06-10-09:00');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_slot_conflict',
      { slotId: '2026-06-10-09:00' },
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_reservation_expired', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingReservationExpired('res_123');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_reservation_expired',
      {},
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_step_completed with step metadata', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingStepCompleted('datetime');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_step_completed',
      { step: 'datetime' },
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_submit_started', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingSubmitStarted();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_submit_started',
      {},
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_submit_succeeded with bookingId', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingSubmitSucceeded('LC123456');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_submit_succeeded',
      {},
    );

    consoleSpy.mockRestore();
  });

  it('tracks booking_submit_failed with error code', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    trackBookingSubmitFailed('RESERVATION_EXPIRED');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[BookingAnalytics]',
      'booking_submit_failed',
      { errorCode: 'RESERVATION_EXPIRED' },
    );

    consoleSpy.mockRestore();
  });
});
