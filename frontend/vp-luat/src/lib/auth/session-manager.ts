// lib/auth/session-manager.ts
// Server-side auth utilities

import { signOut } from 'next-auth/react';
import type { User } from '@/features/auth/types/user';
import { validateRole, validatePermissions } from '@/features/auth/utils/permissions';

// Auth state matching our app's User type
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

// Convert session user to our validated User type
export function toAppUser(sessionUser: { id?: string; email?: string | null; name?: string | null; image?: string | null; role?: string; permissions?: string[] } | null | undefined): User | null {
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

// Logout helper using NextAuth's signOut
export async function logout(callbackUrl = '/login') {
  await signOut({ redirect: true, callbackUrl });
}
