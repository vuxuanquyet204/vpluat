import Link from 'next/link';
import { Phone, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SidebarCta() {
  const t = useTranslations('public.news');
  return (
    <div className="cta-box">
      <div className="cta-box__icon">
        <Phone size={20} />
      </div>
      <h3 className="cta-box__title">{t('ctaTitle')}</h3>
      <p className="cta-box__sub">{t('ctaSubtitle')}</p>
      <Link href="/booking" className="cta-box__btn">
        <Calendar size={14} />
        {t('ctaButton')}
      </Link>
    </div>
  );
}
