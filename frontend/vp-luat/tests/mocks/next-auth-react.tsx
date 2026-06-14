import type { ReactNode } from 'react';

export interface MockSession {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

export function SessionProvider({ children }: { children: ReactNode; session?: MockSession | null }) {
  return children;
}

export function useSession() {
  return {
    data: null,
    status: 'unauthenticated' as const,
    update: async () => null,
  };
}

export async function signIn() {
  return { ok: true, error: null, status: 200, url: null };
}

export async function signOut() {
  return { url: '/' };
}
