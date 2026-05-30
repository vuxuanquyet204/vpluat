import { render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface RenderOptions {
  session?: { user?: { id: string; name: string; email: string; role: string } };
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {}
) {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={options.session ?? null}>
        {ui}
      </SessionProvider>
    </QueryClientProvider>
  );
}

export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
