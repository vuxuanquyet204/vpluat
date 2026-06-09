export interface PublicPageCta {
  label: string;
  href: string;
  variant?: 'primary' | 'outline' | 'outline-dark';
}

export interface HeroStatItem {
  value: string;
  label: string;
  detail?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  href?: string;
  meta?: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  rating?: number;
}

export interface ContactInfoItem {
  label: string;
  value: string;
}

export type LandingBlock =
  | {
      type: 'hero';
      title: string;
      description: string;
      eyebrow?: string;
      ctas?: PublicPageCta[];
      stats?: HeroStatItem[];
    }
  | {
      type: 'feature-grid';
      title: string;
      description?: string;
      items: FeatureItem[];
    }
  | {
      type: 'content';
      title: string;
      body: string[];
    }
  | {
      type: 'faq';
      title: string;
      items: Array<{ question: string; answer: string }>;
    }
  | {
      type: 'testimonials';
      title: string;
      items: TestimonialItem[];
    }
  | {
      type: 'contact';
      title: string;
      description?: string;
      items: ContactInfoItem[];
      ctas?: PublicPageCta[];
    };

export interface LandingPageVariantConfig {
  key: string;
  heroTitle?: string;
  heroDescription?: string;
  heroEyebrow?: string;
  ctaLabel?: string;
}

export interface LandingPageConfig {
  slug: string;
  title: string;
  description: string;
  sectionLabel: string;
  seoTitle?: string;
  keywords?: string[];
  blocks: LandingBlock[];
  variants?: LandingPageVariantConfig[];
}
