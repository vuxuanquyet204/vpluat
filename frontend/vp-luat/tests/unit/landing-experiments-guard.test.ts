import { describe, expect, it } from 'vitest';
import { getLandingPageBySlug } from '@/features/landing-pages/lib';
import { getLandingExperimentAssignment } from '@/features/landing-pages/lib/experiments';

describe('landing experiments security guards', () => {
  it('falls back to control when variant contains invalid characters', () => {
    const page = getLandingPageBySlug('dich-vu');

    expect(page).toBeDefined();
    expect(getLandingExperimentAssignment(page!, 'hero-alt<script>')).toEqual({
      pageSlug: 'dich-vu',
      variant: 'control',
    });
  });
});
