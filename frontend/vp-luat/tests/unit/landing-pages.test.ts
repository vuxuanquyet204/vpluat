import { describe, expect, it } from 'vitest';
import {
  getLandingPageBySlug,
  pickLandingPageVariant,
  publicPageSlugs,
} from '@/features/landing-pages/lib';

describe('landing pages registry', () => {
  it('exposes required public page slugs', () => {
    expect(publicPageSlugs).toEqual([
      'dich-vu',
      'luat-su',
      'blog',
      'tin-tuc',
      'cau-hoi-thuong-gap',
      'danh-gia',
      'lien-he',
    ]);
  });

  it('returns page config for known slug', () => {
    const page = getLandingPageBySlug('dich-vu');

    expect(page).toBeDefined();
    expect(page?.slug).toBe('dich-vu');
    expect(page?.blocks.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown slug', () => {
    expect(getLandingPageBySlug('khong-ton-tai')).toBeUndefined();
  });
});

describe('landing pages A/B selection', () => {
  it('returns default variant when experiment is missing', () => {
    const page = getLandingPageBySlug('dich-vu');

    expect(page).toBeDefined();
    expect(pickLandingPageVariant(page!, undefined)).toBe('control');
  });

  it('returns requested variant when experiment contains a valid key', () => {
    const page = getLandingPageBySlug('dich-vu');

    expect(page).toBeDefined();
    expect(pickLandingPageVariant(page!, 'hero-alt')).toBe('hero-alt');
  });

  it('falls back to control when requested variant is invalid', () => {
    const page = getLandingPageBySlug('dich-vu');

    expect(page).toBeDefined();
    expect(pickLandingPageVariant(page!, 'bad-variant')).toBe('control');
  });
});
