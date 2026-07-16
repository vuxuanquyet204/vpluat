import { auth } from '@/features/auth/providers/auth-provider';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith('/admin') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // After signOut() clears the session, the JWT cookie may still be present
  // on the very next request until the browser applies the Set-Cookie
  // header. Allow the login page to render if we just kicked the user here
  // via the auth interceptor's redirectToLogin() — without this, an expired
  // access token would create an infinite /login → /admin → 401 → /login loop.
  const forceLogin = searchParams.get('forceLogin') === '1';

  if (pathname === '/login' && isLoggedIn && !forceLogin) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/login', '/api/auth/:path*'],
};