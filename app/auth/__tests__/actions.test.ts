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

// Mock rate limiter
jest.mock('@/lib/auth/rate-limiter', () => {
  const actual = jest.requireActual('@/lib/auth/rate-limiter');
  return {
    ...actual,
    checkAuthRateLimit: jest.fn(actual.checkAuthRateLimit),
  };
});

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
      // Exhaust rate limit (5 attempts)
      for (let i = 0; i < 5; i++) {
        await resetPassword(testEmail);
      }

      // 6th attempt should be blocked
      const result = await resetPassword(testEmail);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Too many password reset attempts');
      expect(result.rateLimited).toBe(true);
      expect(result.retryAfter).toBeGreaterThan(0);

      // Should not call Supabase when rate limited
      expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(5);
    });

    it('should provide friendly retry message with minutes', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        await resetPassword(testEmail);
      }

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

      // Exhaust email1 limit
      for (let i = 0; i < 5; i++) {
        await resetPassword(email1);
      }
      const blocked = await resetPassword(email1);
      expect(blocked.rateLimited).toBe(true);

      // email2 should still be allowed
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

    it('should log rate limit information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await resetPassword(testEmail);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit check passed')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('attempts remaining')
      );

      consoleSpy.mockRestore();
    });

    it('should log rate limit exceeded warning', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await resetPassword(testEmail);
      }

      await resetPassword(testEmail);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit exceeded')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Rate Limit Integration', () => {
    it('should reset rate limit after time window', async () => {
      jest.useFakeTimers();
      const email = 'timetest@example.com';

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await resetPassword(email);
      }

      // Should be blocked
      const blocked = await resetPassword(email);
      expect(blocked.rateLimited).toBe(true);

      // Advance time by 1 hour + 1 second
      jest.advanceTimersByTime(60 * 60 * 1000 + 1000);

      // Should be allowed again
      const allowed = await resetPassword(email);
      expect(allowed.success).toBe(true);

      jest.useRealTimers();
    });

    it('should enforce strict 5 attempts per hour limit', async () => {
      const email = 'strict@example.com';
      let successCount = 0;

      // Try 10 attempts
      for (let i = 0; i < 10; i++) {
        const result = await resetPassword(email);
        if (result.success) {
          successCount++;
        }
      }

      // Only first 5 should succeed
      expect(successCount).toBe(5);
      expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(5);
    });
  });
});
