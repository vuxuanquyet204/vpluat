// lib/auth/session-manager.ts
// Server-side auth utilities (khong import next-auth/react o day)

import type { User } from '@/features/auth/types/user';
import { validateRole, validatePermissions } from '@/features/auth/utils/permissions';
import { clearAuthToken } from '@/lib/api/client';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

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

// Server-side helper to clear cached token reference.
// Use this in server actions / route handlers before redirecting after sign-out.
export function clearServerAuth() {
  clearAuthToken();
}