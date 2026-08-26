import { NextResponse } from 'next/server';
import { LOCALE_COOKIE, isLocale } from '@/i18n/locale';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as { locale?: string } | null;

  if (!body?.locale || !isLocale(body.locale)) {
    return NextResponse.json({ error: 'Unsupported locale' }, { status: 400 });
  }

  const response = NextResponse.json({ locale: body.locale });
  response.cookies.set(LOCALE_COOKIE, body.locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
