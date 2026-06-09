import { describe, expect, it } from 'vitest';
import { getLandingPageBySlug } from '@/features/landing-pages/lib';
import { getLandingExperimentAssignment } from '@/features/landing-pages/lib/experiments';

describe('landing experiments', () => {
  it('assigns control when experiment is missing', () => {
    const page = getLandingPageBySlug('dich-vu');

    expect(page).toBeDefined();
    expect(getLandingExperimentAssignment(page!, undefined)).toEqual({
      pageSlug: 'dich-vu',
      variant: 'control',
    });
  });

  it('assigns requested experiment when valid', () => {
    const page = getLandingPageBySlug('dich-vu');

    expect(page).toBeDefined();
    expect(getLandingExperimentAssignment(page!, 'hero-alt')).toEqual({
      pageSlug: 'dich-vu',
      variant: 'hero-alt',
    });
  });
});
