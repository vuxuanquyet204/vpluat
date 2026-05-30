import { describe, it, expect } from 'vitest';
import { validateRole, validatePermissions } from '@/features/auth/utils/permissions';

describe('Permissions Utils', () => {
  describe('validateRole', () => {
    it('returns valid roles as-is', () => {
      expect(validateRole('ADMIN')).toBe('ADMIN');
      expect(validateRole('VIEWER')).toBe('VIEWER');
      expect(validateRole('LAWYER')).toBe('LAWYER');
    });

    it('returns VIEWER for invalid roles', () => {
      expect(validateRole('SUPER_GOD')).toBe('VIEWER');
      expect(validateRole('invalid')).toBe('VIEWER');
      expect(validateRole(null)).toBe('VIEWER');
      expect(validateRole(undefined)).toBe('VIEWER');
    });
  });

  describe('validatePermissions', () => {
    it('returns valid permissions as-is', () => {
      const result = validatePermissions(['dashboard:read', 'bookings:read']);
      expect(result).toEqual(['dashboard:read', 'bookings:read']);
    });

    it('filters out invalid permissions', () => {
      const result = validatePermissions(['dashboard:read', 'DELETE_WORLD', 'invalid']);
      expect(result).toEqual(['dashboard:read']);
    });

    it('returns empty array for non-array input', () => {
      expect(validatePermissions(null)).toEqual([]);
      expect(validatePermissions(undefined)).toEqual([]);
      expect(validatePermissions('string')).toEqual([]);
    });
  });
});
