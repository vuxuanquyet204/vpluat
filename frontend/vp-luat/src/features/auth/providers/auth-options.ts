// Auth options for NextAuth v5
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { Role, Permission } from '../utils/permissions';
import { getPermissions } from '../utils/permissions';
import { setAuthToken } from '@/lib/api/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials: Record<string, unknown> | null) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const result = await response.json();

          if (!result.success || !result.data?.user) {
            return null;
          }

          const data = result.data;
          const user = data.user;

          if (!user.isActive && !user.active) {
            throw new Error('Tai khoan da bi khoa');
          }

          // Store token for apiClient
          setAuthToken(data.accessToken);

          const role = (user.role || 'VIEWER') as Role;
          const accessToken: string | null = (data.accessToken ?? data.token ?? null) as string | null;

          return {
            id: String(user.id ?? user.email ?? ''),
            email: user.email,
            name: user.fullName ?? user.name ?? user.email,
            role,
            permissions: getPermissions(role),
            accessToken,
          };
        } catch (error) {
          console.error('Login failed:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: Record<string, unknown> }) {
      if (user) {
        token.id = String(user.id ?? '');
        token.role = (user.role as string) ?? 'VIEWER';
        token.permissions = (user.permissions as unknown[]) ?? [];
        token.accessToken = user.accessToken ?? null;
      }
      return token;
    },
    async session({ session, token }: { session: Record<string, unknown>; token: Record<string, unknown> }) {
      return {
        ...session,
        user: {
          ...(session.user as Record<string, unknown> | undefined),
          id: (token.id as string) ?? '',
          name: (token.name as string) ?? '',
          email: (token.email as string) ?? '',
          role: (token.role as string) ?? 'VIEWER',
          permissions: (token.permissions as unknown[]) ?? [],
          accessToken: (token.accessToken as string | null) ?? null,
        },
      };
    },
    async authorized({ auth: sessionAuth, request: req }: { auth: unknown; request: { nextUrl: URL } }) {
      const { pathname } = req.nextUrl;
      const isLoggedIn = !!sessionAuth;
      const isOnAdmin = pathname.startsWith('/admin');
      const isOnLogin = pathname === '/login';

      if (isOnAdmin && !isLoggedIn) return false;
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/admin', req.nextUrl));
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
} as Record<string, unknown>;

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions as any);
