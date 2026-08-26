import type { Locale } from './routing';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: string | undefined): value is Locale {
  return value === 'vi' || value === 'en';
}
