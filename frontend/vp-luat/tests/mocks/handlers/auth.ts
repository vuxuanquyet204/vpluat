import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // Mock login endpoint
  http.post('/api/auth/callback/credentials', () => {
    return HttpResponse.json({
      ok: true,
      status: 200,
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        permissions: ['dashboard:read', 'bookings:read'],
      },
    });
  }),

  // Mock session endpoint
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      },
    });
  }),
];
