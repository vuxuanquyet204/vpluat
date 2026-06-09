import { http, HttpResponse } from 'msw';

const bookedTimes = new Set(['08:00', '09:30', '10:00', '15:00']);
const reservationStore = new Map<string, { expiresAt: string }>();

function createSlots(date: string) {
  const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  return times.map((time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const endHours = minutes + 45 >= 60 ? hours + 1 : hours;
    const endMinutes = (minutes + 45) % 60;

    return {
      slotId: `${date}-${time}`,
      startTime: time,
      endTime: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
      status: bookedTimes.has(time) ? 'booked' : 'available',
    };
  });
}

export const bookingHandlers = [
  http.get('http://localhost:8080/api/availability', ({ request }) => {
    const url = new URL(request.url);
    const lawyerId = url.searchParams.get('lawyerId') ?? 'lawyer-nguyen-van-hung';
    const date = url.searchParams.get('date') ?? '2026-06-10';

    return HttpResponse.json({
      date,
      lawyerId,
      slots: createSlots(date),
    });
  }),

  http.post('http://localhost:8080/api/availability/reserve', async ({ request }) => {
    const body = (await request.json()) as {
      lawyerId: string;
      date: string;
      slotId: string;
    };

    if (body.slotId.endsWith('08:00') || body.slotId.endsWith('09:30')) {
      return HttpResponse.json(
        { code: 'SLOT_ALREADY_RESERVED', message: 'Slot already reserved' },
        { status: 409 },
      );
    }

    const [date, startTime] = body.slotId.split(/-(?=\d{2}:\d{2}$)/);
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = minutes + 45 >= 60 ? hours + 1 : hours;
    const endMinutes = (minutes + 45) % 60;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const reservationId = `res_${body.slotId}`;

    reservationStore.set(reservationId, { expiresAt });

    return HttpResponse.json({
      reservationId,
      slotId: body.slotId,
      lawyerId: body.lawyerId,
      date,
      startTime,
      endTime: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
      expiresAt,
    });
  }),

  http.post('http://localhost:8080/api/availability/release', async ({ request }) => {
    const body = (await request.json()) as { reservationId: string };
    reservationStore.delete(body.reservationId);
    return HttpResponse.json({ success: true });
  }),

  http.get('http://localhost:8080/api/availability/reservations/:reservationId', ({ params }) => {
    const reservationId = params.reservationId as string;
    const reservation = reservationStore.get(reservationId);

    if (!reservation) {
      return HttpResponse.json(
        {
          reservationId,
          status: 'expired',
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        },
        { status: 200 },
      );
    }

    return HttpResponse.json({
      reservationId,
      status: 'active',
      expiresAt: reservation.expiresAt,
    });
  }),

  http.post('http://localhost:8080/api/bookings', async ({ request }) => {
    const body = (await request.json()) as {
      reservationId: string;
      serviceId: string;
      lawyerId: string;
      consultationType: string;
      customer: {
        fullName: string;
        phone: string;
        email?: string;
        issueSummary: string;
      };
    };

    if (!reservationStore.has(body.reservationId)) {
      return HttpResponse.json(
        { code: 'RESERVATION_EXPIRED', message: 'Reservation expired' },
        { status: 410 },
      );
    }

    reservationStore.delete(body.reservationId);

    return HttpResponse.json(
      {
        bookingId: 'LC123456',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
