// lib/api/server-client.ts
// Server-side API client with Bearer token

import { auth } from '@/features/auth/providers/auth-provider';

// Extend NextAuth Session with our custom fields
interface ExtendedSession {
  user?: {
    id?: string;
    role?: string;
    permissions?: string[];
    name?: string;
    email?: string;
    image?: string;
  };
  accessToken?: string;
  expires: string;
}

export async function serverFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const session = (await auth()) as ExtendedSession | null;
  const token = session?.accessToken;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
