import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Calendar, Phone, ArrowRight } from 'lucide-react';

export function ServicesCta() {
  const t = useTranslations('public.services.cta');

  return (
    <section className="services-cta-section">
      <div className="container">
        <div className="services-cta-box">
          <div className="services-cta-content">
            <div className="services-cta-eyebrow">{t('eyebrow')}</div>
            <h2 className="services-cta-title">
              {t('title')} <em>{t('highlight')}</em> {t('titleSuffix')}
            </h2>
            <p className="services-cta-sub">{t('subtitle')}</p>
            <div className="services-cta-buttons">
              <Link href="/booking" className="services-cta-btn services-cta-btn--primary">
                <Calendar size={16} aria-hidden="true" />
                {t('book')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href="tel:19001234" className="services-cta-btn services-cta-btn--outline">
                <Phone size={16} aria-hidden="true" />
                {t('call')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
