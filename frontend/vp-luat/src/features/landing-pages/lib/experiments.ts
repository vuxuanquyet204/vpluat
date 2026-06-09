import type { LandingPageConfig } from '@/features/landing-pages';

export interface LandingExperimentAssignment {
  pageSlug: string;
  variant: string;
}

export function getLandingExperimentAssignment(
  page: LandingPageConfig,
  experiment?: string
): LandingExperimentAssignment {
  const knownVariant = page.variants?.some((variant) => variant.key === experiment);

  return {
    pageSlug: page.slug,
    variant: knownVariant && experiment ? experiment : page.variants?.[0]?.key ?? 'control',
  };
}
