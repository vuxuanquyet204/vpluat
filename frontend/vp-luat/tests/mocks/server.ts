import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { bookingHandlers } from './handlers/booking';

export const server = setupServer(...authHandlers, ...bookingHandlers);
