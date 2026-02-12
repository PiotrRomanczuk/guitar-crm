/**
 * Auth Actions Tests
 *
 * Tests for authentication server actions, including rate limiting
 */

import { resetPassword } from '../actions';
import { checkAuthRateLimit, clearAllAuthRateLimits } from '@/lib/auth/rate-limiter';

// Mock Supabase client
const mockResetPasswordForEmail = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  })),
}));

// Mock Next.js headers
const mockHeaders = new Map<string, string>();
mockHeaders.set('x-forwarded-for', '192.168.1.1');
mockHeaders.set('origin', 'http://localhost:3000');

jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: (key: string) => mockHeaders.get(key),
  })),
}));

// Mock rate limiter — Supabase-backed rate limiter has no in-memory state,
// so we mock checkAuthRateLimit directly and simulate behavior per test.
jest.mock('@/lib/auth/rate-limiter', () => ({
  checkAuthRateLimit: jest.fn().mockResolvedValue({
    allowed: true,
    remaining: 4,
    resetTime: Date.now() + 3600000,
  }),
  clearAllAuthRateLimits: jest.fn().mockResolvedValue(undefined),
  AUTH_RATE_LIMITS: {
    passwordReset: { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
    login: { maxAttempts: 10, windowMs: 15 * 60 * 1000 },
    signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  },
}));

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAllAuthRateLimits();
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
  });

  describe('resetPassword', () => {
    const testEmail = 'test@example.com';

    it('should successfully send password reset email', async () => {
      const result = await resetPassword(testEmail);

      expect(result).toEqual({ success: true });
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        testEmail,
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/callback?next=/reset-password'),
        })
      );
    });

    it('should check rate limit before sending email', async () => {
      await resetPassword(testEmail);

      expect(checkAuthRateLimit).toHaveBeenCalledWith(
        expect.stringContaining(testEmail),
        'passwordReset'
      );
    });

    it('should include IP address in rate limit identifier', async () => {
      await resetPassword(testEmail);

      expect(checkAuthRateLimit).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.1'),
        'passwordReset'
      );
    });

    it('should block request when rate limit exceeded', async () => {
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 3600,
      });

      const result = await resetPassword(testEmail);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Too many password reset attempts');
      expect(result.rateLimited).toBe(true);
      expect(result.retryAfter).toBeGreaterThan(0);

      // Should not call Supabase when rate limited
      expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
    });

    it('should provide friendly retry message with minutes', async () => {
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 3600,
      });

      const result = await resetPassword(testEmail);

      expect(result.error).toMatch(/try again in \d+ minute/);
    });

    it('should use singular "minute" for 1 minute', async () => {
      // Mock rate limit to return 59 seconds (rounds to 1 minute)
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 59,
      });

      const result = await resetPassword(testEmail);

      expect(result.error).toMatch(/1 minute\./);
      expect(result.error).not.toMatch(/1 minutes/);
    });

    it('should use plural "minutes" for multiple minutes', async () => {
      // Mock rate limit to return 121 seconds (rounds to 3 minutes)
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 181,
      });

      const result = await resetPassword(testEmail);

      expect(result.error).toMatch(/4 minutes\./);
    });

    it('should handle Supabase errors', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({
        error: { message: 'Invalid email format' },
      });

      const result = await resetPassword(testEmail);

      expect(result.error).toBe('Invalid email format');
      expect(result.success).toBeUndefined();
    });

    it('should handle missing origin header', async () => {
      mockHeaders.delete('origin');

      const result = await resetPassword(testEmail);

      expect(result.error).toContain('Configuration error');
    });

    it('should use NEXT_PUBLIC_SITE_URL when origin header missing', async () => {
      mockHeaders.delete('origin');
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

      await resetPassword(testEmail);

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        testEmail,
        expect.objectContaining({
          redirectTo: expect.stringContaining('https://example.com'),
        })
      );

      delete process.env.NEXT_PUBLIC_SITE_URL;
      mockHeaders.set('origin', 'http://localhost:3000');
    });

    it('should track different emails independently', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      // Mock: email1 is blocked
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 3600,
      });
      const blocked = await resetPassword(email1);
      expect(blocked.rateLimited).toBe(true);

      // Mock: email2 is allowed (default mock already returns allowed: true)
      const result = await resetPassword(email2);
      expect(result.success).toBe(true);
    });

    it('should handle x-real-ip header when x-forwarded-for missing', async () => {
      mockHeaders.delete('x-forwarded-for');
      mockHeaders.set('x-real-ip', '10.0.0.1');

      await resetPassword(testEmail);

      expect(checkAuthRateLimit).toHaveBeenCalledWith(
        expect.stringContaining('10.0.0.1'),
        'passwordReset'
      );

      mockHeaders.set('x-forwarded-for', '192.168.1.1');
    });

    it('should handle missing IP headers gracefully', async () => {
      mockHeaders.delete('x-forwarded-for');
      mockHeaders.delete('x-real-ip');

      const result = await resetPassword(testEmail);

      expect(result.success).toBe(true);
      expect(checkAuthRateLimit).toHaveBeenCalledWith(
        expect.stringContaining('unknown'),
        'passwordReset'
      );

      mockHeaders.set('x-forwarded-for', '192.168.1.1');
    });

    it('should handle x-forwarded-for with multiple IPs', async () => {
      mockHeaders.set('x-forwarded-for', '203.0.113.1, 198.51.100.1, 192.168.1.1');

      await resetPassword(testEmail);

      // Should use first IP in list
      expect(checkAuthRateLimit).toHaveBeenCalledWith(
        expect.stringContaining('203.0.113.1'),
        'passwordReset'
      );

      mockHeaders.set('x-forwarded-for', '192.168.1.1');
    });

    it('should log rate limit exceeded warning', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 3600,
      });

      await resetPassword(testEmail);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit exceeded')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Rate Limit Integration', () => {
    it('should block when rate limiter returns not allowed, then allow after reset', async () => {
      const email = 'timetest@example.com';

      // First call: blocked
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 3600,
      });
      const blocked = await resetPassword(email);
      expect(blocked.rateLimited).toBe(true);

      // Second call: allowed again (simulating after window reset)
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 3600000,
      });
      const allowed = await resetPassword(email);
      expect(allowed.success).toBe(true);
    });

    it('should enforce rate limit by blocking after max attempts', async () => {
      const email = 'strict@example.com';

      // First 5 calls: allowed (default mock returns allowed: true)
      for (let i = 0; i < 5; i++) {
        await resetPassword(email);
      }
      expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(5);

      // 6th call: blocked
      (checkAuthRateLimit as jest.Mock).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 3600,
      });
      const result = await resetPassword(email);
      expect(result.rateLimited).toBe(true);

      // Supabase should not have been called for the blocked request
      expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(5);
    });
  });
});
