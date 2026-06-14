import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { bookingHandlers } from './handlers/booking';
import { handlers as chatbotHandlers } from './handlers/chatbot';
import { adminHandlers } from './handlers/admin';

export const server = setupServer(
  ...authHandlers,
  ...bookingHandlers,
  ...chatbotHandlers,
  ...adminHandlers,
);
