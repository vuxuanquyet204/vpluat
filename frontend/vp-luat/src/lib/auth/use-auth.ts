// lib/auth/use-auth.ts
// React hook for auth - wraps NextAuth's useSession()

import { useSession, signOut } from 'next-auth/react';
import type { User } from '@/features/auth/types/user';
import { validateRole, validatePermissions } from '@/features/auth/utils/permissions';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

// Convert NextAuth session user to our validated User type
function toAppUser(sessionUser: { id?: string; email?: string | null; name?: string | null; image?: string | null; role?: string; permissions?: string[] } | null | undefined): User | null {
  if (!sessionUser) return null;

  return {
    id: sessionUser.id ?? '',
    email: sessionUser.email ?? '',
    name: sessionUser.name ?? '',
    role: validateRole(sessionUser.role),
    permissions: validatePermissions(sessionUser.permissions),
    avatar: sessionUser.image ?? undefined,
  };
}

export function useAuth(): AuthState & { logout: (callbackUrl?: string) => Promise<void> } {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: status === 'authenticated' ? toAppUser(session?.user) : null,
    logout: async (callbackUrl = '/login') => {
      await signOut({ redirect: true, callbackUrl });
    },
  };
}
