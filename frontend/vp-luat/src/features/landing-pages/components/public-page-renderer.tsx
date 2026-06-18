import Link from 'next/link';
import { Star } from 'lucide-react';
import type { LandingBlock, LandingPageConfig, LandingPageVariantConfig } from '@/features/landing-pages';

interface PublicPageRendererProps {
  page: LandingPageConfig;
  variant?: LandingPageVariantConfig;
}

function getButtonClass(variant?: 'primary' | 'outline' | 'outline-dark') {
  switch (variant) {
    case 'outline':
      return 'btn btn--outline';
    case 'outline-dark':
      return 'btn btn--outline-dark';
    default:
      return 'btn btn--primary';
  }
}

function renderBlock(block: LandingBlock, index: number) {
  switch (block.type) {
    case 'hero':
      return (
        <section key={`${block.type}-${index}`} className="public-page-hero">
          <div className="container public-page-hero__inner">
            {block.eyebrow ? <span className="section__label">{block.eyebrow}</span> : null}
            <h1 className="public-page-hero__title">{block.title}</h1>
            <p className="public-page-hero__description">{block.description}</p>
            {block.ctas?.length ? (
              <div className="public-page-hero__actions">
                {block.ctas.map((cta) => {
                  const isExternal = cta.href.startsWith('tel:') || cta.href.startsWith('http');
                  const className = `${getButtonClass(cta.variant)} btn--lg`;

                  return isExternal ? (
                    <a key={cta.href + cta.label} href={cta.href} className={className}>
                      {cta.label}
                    </a>
                  ) : (
                    <Link key={cta.href + cta.label} href={cta.href} className={className}>
                      {cta.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
            {block.stats?.length ? (
              <div className="public-page-hero__stats">
                {block.stats.map((stat) => (
                  <div key={stat.label} className="public-page-stat">
                    <div className="public-page-stat__value">{stat.value}</div>
                    <div className="public-page-stat__label">{stat.label}</div>
                    {stat.detail ? <div className="public-page-stat__detail">{stat.detail}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      );
    case 'feature-grid':
      return (
        <section key={`${block.type}-${index}`} className={`section ${index % 2 === 0 ? '' : 'section--gray'}`}>
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">{block.title}</h2>
              {block.description ? <p className="section__subtitle">{block.description}</p> : null}
            </div>
            <div className="public-feature-grid">
              {block.items.map((item) => (
                <article key={item.title} className="public-feature-card">
                  <h3 className="public-feature-card__title">{item.title}</h3>
                  <p className="public-feature-card__description">{item.description}</p>
                  {item.meta ? <span className="public-feature-card__meta">{item.meta}</span> : null}
                  {item.href ? (
                    <Link href={item.href} className="public-feature-card__link">
                      Tìm hiểu thêm
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    case 'content':
      return (
        <section key={`${block.type}-${index}`} className={`section ${index % 2 === 0 ? 'section--gray' : ''}`}>
          <div className="container public-richtext">
            <div className="section__header">
              <h2 className="section__title">{block.title}</h2>
            </div>
            <div className="public-richtext__body">
              {block.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      );
    case 'faq':
      return (
        <section key={`${block.type}-${index}`} className="section section--gray">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">{block.title}</h2>
            </div>
            <div className="faq__container">
              {block.items.map((item) => (
                <article key={item.question} className="faq-item active public-faq-item">
                  <div className="faq-item__question public-faq-item__question">
                    <span>{item.question}</span>
                  </div>
                  <div className="faq-item__answer active">
                    <div className="faq-item__answer-inner">{item.answer}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    case 'testimonials':
      return (
        <section key={`${block.type}-${index}`} className="section">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">{block.title}</h2>
            </div>
            <div className="public-testimonials-grid">
              {block.items.map((item) => (
                <article key={item.author + item.role} className="public-testimonial-card">
                  {item.rating ? (
                    <div className="public-testimonial-card__rating" aria-label={`${item.rating} sao`}>
                      {Array.from({ length: item.rating }).map((_, starIdx) => (
                        <Star key={starIdx} size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                      ))}
                    </div>
                  ) : null}
                  <p className="public-testimonial-card__quote">“{item.quote}”</p>
                  <div className="public-testimonial-card__author">{item.author}</div>
                  <div className="public-testimonial-card__role">{item.role}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    case 'contact':
      return (
        <section key={`${block.type}-${index}`} className="section section--gray">
          <div className="container public-contact-panel">
            <div className="section__header">
              <h2 className="section__title">{block.title}</h2>
              {block.description ? <p className="section__subtitle">{block.description}</p> : null}
            </div>
            <div className="public-contact-panel__grid">
              {block.items.map((item) => (
                <div key={item.label} className="public-contact-item">
                  <span className="public-contact-item__label">{item.label}</span>
                  <span className="public-contact-item__value">{item.value}</span>
                </div>
              ))}
            </div>
            {block.ctas?.length ? (
              <div className="public-contact-panel__actions">
                {block.ctas.map((cta) => (
                  <Link key={cta.href + cta.label} href={cta.href} className={getButtonClass(cta.variant)}>
                    {cta.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      );
    default:
      return null;
  }
}

export function PublicPageRenderer({ page, variant }: PublicPageRendererProps) {
  const resolvedBlocks = page.blocks.map((block) => {
    if (block.type !== 'hero' || !variant) {
      return block;
    }

    return {
      ...block,
      eyebrow: variant.heroEyebrow ?? block.eyebrow,
      title: variant.heroTitle ?? block.title,
      description: variant.heroDescription ?? block.description,
      ctas:
        variant.ctaLabel && block.ctas?.length
          ? [{ ...block.ctas[0], label: variant.ctaLabel }, ...block.ctas.slice(1)]
          : block.ctas,
    };
  });

  return <>{resolvedBlocks.map((block, index) => renderBlock(block, index))}</>;
}
