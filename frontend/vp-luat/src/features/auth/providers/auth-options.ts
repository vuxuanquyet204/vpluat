// Auth options for getServerSession
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { Role, Permission } from '../utils/permissions';

// Extend NextAuth types (see src/types/next-auth.d.ts)

// Custom JWT type matching our Role/Permission types
type CustomJWT = {
  id?: string;
  role?: Role;
  permissions?: Permission[];
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials: Record<string, unknown> | null) {
        // TODO: Call backend API - implement JWT verification with Spring Boot backend
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: CustomJWT; user: { id?: string; role?: Role; permissions?: Permission[] } | null }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    session({ session, token }: { session: { expires: string; user: { id?: string; name?: string | null; email?: string | null; image?: string | null; role?: Role; permissions?: Permission[] } }; token: CustomJWT }) {
      return {
        expires: session.expires,
        user: {
          ...session.user,
          id: token.id ?? '',
          role: token.role ?? 'VIEWER',
          permissions: token.permissions ?? [],
        },
      };
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' as const },
};

export default NextAuth(authOptions);
