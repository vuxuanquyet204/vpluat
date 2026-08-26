'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

const LANGUAGES = [
  { code: 'vi', label: 'VI', name: 'Tiếng Việt' },
  { code: 'en', label: 'EN', name: 'English' },
] as const satisfies ReadonlyArray<{ code: Locale; label: string; name: string }>;

interface LanguageSwitcherProps {
  layout?: 'desktop' | 'mobile';
  className?: string;
}

export function LanguageSwitcher({ layout = 'desktop', className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();

  const changeLocale = async (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ locale: nextLocale }),
    });
    router.refresh();
  };

  if (layout === 'mobile') {
    return (
      <div className={cn('mobile-menu__lang', className)}>
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            className={cn('mobile-menu__lang-btn', locale === language.code && 'active')}
            onClick={() => changeLocale(language.code)}
            aria-label={language.name}
            aria-pressed={locale === language.code}
          >
            {language.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('navbar__lang', className)} role="group" aria-label="Language">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          className={cn('navbar__lang-btn', locale === language.code && 'active')}
          onClick={() => changeLocale(language.code)}
          aria-label={language.name}
          aria-pressed={locale === language.code}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}
