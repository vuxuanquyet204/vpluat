import { describe, expect, it } from 'vitest';
import { bookingFormSchema } from '@/features/booking/schemas';

describe('booking form schema', () => {
  describe('fullName', () => {
    it('accepts valid full name', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        issueSummary: 'Cần tư vấn hợp đồng',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
    });

    it('rejects empty full name', () => {
      const result = bookingFormSchema.safeParse({
        fullName: '',
        phone: '0912345678',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(false);
    });

    it('rejects full name with only whitespace', () => {
      const result = bookingFormSchema.safeParse({
        fullName: '   ',
        phone: '0912345678',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('phone', () => {
    it('accepts valid Vietnamese mobile number starting with 0', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
    });

    it('accepts phone with spaces', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912 345 678',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
    });

    it('rejects empty phone', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(false);
    });

    it('rejects phone that is too short', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('email', () => {
    it('accepts valid email', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        email: 'test@example.com',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
    });

    it('accepts empty email (optional)', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        email: '',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        email: 'not-an-email',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('issueSummary', () => {
    it('accepts non-empty issue summary', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        issueSummary: 'Cần tư vấn tranh chấp hợp đồng thuê nhà.',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
    });

    it('rejects empty issue summary', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        issueSummary: '',
        agreedToTerms: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('agreedToTerms', () => {
    it('rejects when not agreed', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: false,
      });

      expect(result.success).toBe(false);
    });

    it('accepts when agreed', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912345678',
        issueSummary: 'Cần tư vấn',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('complete valid submission', () => {
    it('accepts fully valid form data', () => {
      const result = bookingFormSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phone: '0912 345 678',
        email: 'a@example.com',
        issueSummary: 'Cần tư vấn về hợp đồng lao động.',
        agreedToTerms: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Nguyễn Văn A');
        expect(result.data.phone).toBe('0912 345 678');
      }
    });
  });
});
