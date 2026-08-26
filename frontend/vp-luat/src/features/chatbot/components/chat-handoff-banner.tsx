'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function ChatHandoffBanner() {
  const t = useTranslations('chatbot');

  return (
    <div className="handoff-banner" role="region" aria-label={t('handoffLabel')}>
      <span className="handoff-banner__dot" aria-hidden="true" />
      <span className="handoff-banner__text">
        {t('consultantOnline')}
      </span>
      <Link href="/booking" className="handoff-banner__btn">
        {t('handoffLabel')}
      </Link>
    </div>
  );
}
