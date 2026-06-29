// Type augmentation for NextAuth with custom user fields
import type { Role, Permission } from '@/features/auth/utils/permissions';

declare module 'next-auth' {
  interface Session {
    expires?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      permissions: Permission[];
    };
  }

  interface User {
    id: string;
    role: Role;
    permissions: Permission[];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
    permissions?: Permission[];
  }
}
