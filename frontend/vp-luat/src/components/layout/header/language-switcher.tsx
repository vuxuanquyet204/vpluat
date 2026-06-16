'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'vi', label: 'VI', name: 'Tiếng Việt' },
  { code: 'en', label: 'EN', name: 'English' },
] as const;

type LangCode = (typeof LANGUAGES)[number]['code'];

interface LanguageSwitcherProps {
  layout?: 'desktop' | 'mobile';
  className?: string;
}

export function LanguageSwitcher({ layout = 'desktop', className }: LanguageSwitcherProps) {
  const [current, setCurrent] = useState<LangCode>('vi');

  if (layout === 'mobile') {
    return (
      <div className={cn('mobile-menu__lang', className)}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className={cn('mobile-menu__lang-btn', current === lang.code && 'active')}
            onClick={() => setCurrent(lang.code)}
            aria-label={lang.name}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('navbar__lang', className)}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={cn('navbar__lang-btn', current === lang.code && 'active')}
          onClick={() => setCurrent(lang.code)}
          aria-label={lang.name}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
