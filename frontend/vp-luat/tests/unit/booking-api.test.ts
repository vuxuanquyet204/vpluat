import { describe, expect, it } from 'vitest';
import {
  fetchAvailability,
  reserveSlot,
  submitBooking,
  verifyReservation,
} from '@/features/booking/api';

describe('booking api', () => {
  it('fetches availability for selected lawyer and date', async () => {
    const result = await fetchAvailability({
      lawyerId: 'lawyer-nguyen-van-hung',
      date: '2026-06-10',
    });

    expect(result.lawyerId).toBe('lawyer-nguyen-van-hung');
    expect(result.date).toBe('2026-06-10');
    expect(result.slots.length).toBeGreaterThan(0);
  });

  it('reserves and verifies an available slot', async () => {
    const reservation = await reserveSlot({
      lawyerId: 'lawyer-nguyen-van-hung',
      date: '2026-06-10',
      slotId: '2026-06-10-08:30',
    });

    expect(reservation.reservationId).toContain('res_');

    const verification = await verifyReservation(reservation.reservationId);
    expect(verification.status).toBe('active');
  });

  it('submits booking successfully with active reservation', async () => {
    const reservation = await reserveSlot({
      lawyerId: 'lawyer-nguyen-van-hung',
      date: '2026-06-10',
      slotId: '2026-06-10-09:00',
    });

    const result = await submitBooking({
      reservationId: reservation.reservationId,
      serviceId: 'service-doanh-nghiep',
      lawyerId: 'lawyer-nguyen-van-hung',
      consultationType: 'office',
      customer: {
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        email: 'a@example.com',
        issueSummary: 'Cần tư vấn hợp đồng.',
      },
    });

    expect(result.bookingId).toBe('LC123456');
    expect(result.status).toBe('confirmed');
  });
});
