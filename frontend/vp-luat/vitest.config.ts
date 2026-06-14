import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features/chatbot/state': path.resolve(__dirname, './src/features/chatbot/state'),
      '@/features/chatbot/config/conversation-flow': path.resolve(__dirname, './src/features/chatbot/config/conversation-flow'),
      'next-auth/react': path.resolve(__dirname, './tests/mocks/next-auth-react.tsx'),
      'next-auth/providers/credentials': path.resolve(
        __dirname,
        './tests/mocks/next-auth-credentials.ts',
      ),
      'next-auth': path.resolve(__dirname, './tests/mocks/next-auth.ts'),
      '@/features/auth/providers/auth-provider': path.resolve(
        __dirname,
        './tests/mocks/auth-provider.ts',
      ),
    },
  },
});
