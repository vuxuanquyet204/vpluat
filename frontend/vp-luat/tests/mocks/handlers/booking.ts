import { http, HttpResponse } from 'msw';

export const bookingHandlers = [
  // Mock booking list endpoint
  http.get('/api/bookings', () => {
    return HttpResponse.json({
      data: [
        { id: '1', clientName: 'Nguyễn Văn A', date: '2026-06-01', status: 'PENDING' },
        { id: '2', clientName: 'Trần Thị B', date: '2026-06-02', status: 'CONFIRMED' },
      ],
      total: 2,
    });
  }),

  // Mock create booking endpoint
  http.post('/api/bookings', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: '3',
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),
];
