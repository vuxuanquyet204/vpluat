import type { LandingBlock } from '@/features/landing-pages';

export interface LandingTemplateDraft {
  name: string;
  blocks: LandingBlock[];
}

export function buildLandingTemplateDraft(name: string, blocks: LandingBlock[]): LandingTemplateDraft {
  return {
    name,
    blocks,
  };
}
