import { auth } from '@/features/auth/providers/auth-provider';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const forceLogin = searchParams.get('forceLogin') === '1';

  if (pathname.startsWith('/en/')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = pathname.slice('/en'.length) || '/';
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === '/en') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith('/admin') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && isLoggedIn && !forceLogin) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
