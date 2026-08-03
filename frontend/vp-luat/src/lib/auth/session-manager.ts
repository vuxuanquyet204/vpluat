// lib/auth/session-manager.ts
// Server-side auth utilities (khong import next-auth/react o day)

import type { User } from '@/features/auth/types/user';
import { validateRole, validatePermissions } from '@/features/auth/utils/permissions';

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

// Server-side helper. The previous implementation imported the client-side
// axios-based token cache, which crashed when called from a server component
// (axios reads `XMLHttpRequest` at import time). Token clearing on the server
// is a no-op because the cache only ever lives in the browser; if any future
// server-side action needs to invalidate auth state it should call NextAuth's
// `signOut` instead.
export function clearServerAuth(): void {
  // no-op: clearAuthToken() requires the browser cache.
}