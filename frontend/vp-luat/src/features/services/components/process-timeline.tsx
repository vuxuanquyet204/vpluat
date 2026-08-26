import { ListOrdered } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

export function ProcessTimeline() {
  const t = useTranslations('public.services.process');
  const { data: siteContent } = usePublicSiteContent();
  const steps = siteContent?.processSteps ?? [];

  return (
    <section className="process-section">
      <div className="container">
        <div className="section__header">
          <div className="section__label">{t('label')}</div>
          <h2 className="section__title">{t('title')}</h2>
          <p className="section__subtitle">{t('subtitle')}</p>
        </div>

        <div className="process-timeline">
          {steps.map((step, index) => (
            <div key={index} className="process-step">
              <div className="process-step__num">
                <ListOrdered size={20} aria-hidden="true" />
              </div>
              <h3 className="process-step__title">{step.title}</h3>
              <p className="process-step__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
