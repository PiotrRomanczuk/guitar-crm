/**
 * Auth Rate Limiter Tests
 *
 * Tests for authentication rate limiting functionality
 */

import {
  checkAuthRateLimit,
  resetAuthRateLimit,
  clearAllAuthRateLimits,
  cleanupExpiredAuthEntries,
  getAuthRateLimitStatus,
  AUTH_RATE_LIMITS,
} from './rate-limiter';

describe('Auth Rate Limiter', () => {
  beforeEach(() => {
    clearAllAuthRateLimits();
  });

  afterEach(() => {
    clearAllAuthRateLimits();
  });

  describe('AUTH_RATE_LIMITS Configuration', () => {
    it('should have correct password reset limits', () => {
      expect(AUTH_RATE_LIMITS.passwordReset.maxAttempts).toBe(5);
      expect(AUTH_RATE_LIMITS.passwordReset.windowMs).toBe(60 * 60 * 1000); // 1 hour
    });

    it('should have correct login limits', () => {
      expect(AUTH_RATE_LIMITS.login.maxAttempts).toBe(10);
      expect(AUTH_RATE_LIMITS.login.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should have correct signup limits', () => {
      expect(AUTH_RATE_LIMITS.signup.maxAttempts).toBe(3);
      expect(AUTH_RATE_LIMITS.signup.windowMs).toBe(60 * 60 * 1000); // 1 hour
    });
  });

  describe('checkAuthRateLimit - Password Reset', () => {
    const identifier = 'test@example.com';
    const operation = 'passwordReset' as const;

    it('should allow first request', async () => {
      const result = await checkAuthRateLimit(identifier, operation);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 1
      expect(result.retryAfter).toBeUndefined();
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should track request count correctly', async () => {
      const result1 = await checkAuthRateLimit(identifier, operation);
      expect(result1.remaining).toBe(4);

      const result2 = await checkAuthRateLimit(identifier, operation);
      expect(result2.remaining).toBe(3);

      const result3 = await checkAuthRateLimit(identifier, operation);
      expect(result3.remaining).toBe(2);
    });

    it('should block requests after 5 attempts', async () => {
      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        const result = await checkAuthRateLimit(identifier, operation);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blockedResult = await checkAuthRateLimit(identifier, operation);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
      expect(blockedResult.retryAfter).toBeDefined();
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
    });

    it('should provide retryAfter in seconds', async () => {
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        await checkAuthRateLimit(identifier, operation);
      }

      const result = await checkAuthRateLimit(identifier, operation);
      expect(result.retryAfter).toBeLessThanOrEqual(3600); // 1 hour max
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track different identifiers independently', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      // Exhaust email1 limit
      for (let i = 0; i < 5; i++) {
        await checkAuthRateLimit(email1, operation);
      }
      const blocked = await checkAuthRateLimit(email1, operation);
      expect(blocked.allowed).toBe(false);

      // email2 should still be allowed
      const result = await checkAuthRateLimit(email2, operation);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should reset after time window expires', async () => {
      jest.useFakeTimers();

      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        await checkAuthRateLimit(identifier, operation);
      }

      // Should be blocked
      const blocked = await checkAuthRateLimit(identifier, operation);
      expect(blocked.allowed).toBe(false);

      // Advance time past the window (1 hour + 1 second)
      jest.advanceTimersByTime(60 * 60 * 1000 + 1000);

      // Should be allowed again
      const allowed = await checkAuthRateLimit(identifier, operation);
      expect(allowed.allowed).toBe(true);
      expect(allowed.remaining).toBe(4);

      jest.useRealTimers();
    });

    it('should handle IP addresses as identifiers', async () => {
      const ip = '192.168.1.1';
      const result = await checkAuthRateLimit(ip, operation);
      expect(result.allowed).toBe(true);
    });

    it('should handle combined identifiers (email+ip)', async () => {
      const combined = 'test@example.com:192.168.1.1';
      const result = await checkAuthRateLimit(combined, operation);
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkAuthRateLimit - Different Operations', () => {
    const identifier = 'test@example.com';

    it('should track login attempts separately from password reset', async () => {
      // Exhaust password reset limit
      for (let i = 0; i < 5; i++) {
        await checkAuthRateLimit(identifier, 'passwordReset');
      }
      const resetBlocked = await checkAuthRateLimit(identifier, 'passwordReset');
      expect(resetBlocked.allowed).toBe(false);

      // Login should still be allowed
      const loginResult = await checkAuthRateLimit(identifier, 'login');
      expect(loginResult.allowed).toBe(true);
      expect(loginResult.remaining).toBe(9); // 10 - 1
    });

    it('should track signup attempts with stricter limits', async () => {
      // Make 3 signup attempts
      for (let i = 0; i < 3; i++) {
        const result = await checkAuthRateLimit(identifier, 'signup');
        expect(result.allowed).toBe(true);
      }

      // 4th attempt should be blocked
      const blocked = await checkAuthRateLimit(identifier, 'signup');
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('resetAuthRateLimit', () => {
    it('should reset rate limit for specific identifier and operation', async () => {
      const identifier = 'test@example.com';
      const operation = 'passwordReset' as const;

      // Make 3 attempts
      for (let i = 0; i < 3; i++) {
        await checkAuthRateLimit(identifier, operation);
      }

      // Reset the limit
      resetAuthRateLimit(identifier, operation);

      // Should have full limit again
      const result = await checkAuthRateLimit(identifier, operation);
      expect(result.remaining).toBe(4); // 5 - 1 (fresh count)
    });

    it('should only reset specified operation', async () => {
      const identifier = 'test@example.com';

      // Make attempts for both operations
      await checkAuthRateLimit(identifier, 'passwordReset');
      await checkAuthRateLimit(identifier, 'passwordReset');
      await checkAuthRateLimit(identifier, 'login');

      // Reset only password reset
      resetAuthRateLimit(identifier, 'passwordReset');

      // Password reset should be reset
      const resetResult = await checkAuthRateLimit(identifier, 'passwordReset');
      expect(resetResult.remaining).toBe(4);

      // Login should still have count
      const loginResult = await checkAuthRateLimit(identifier, 'login');
      expect(loginResult.remaining).toBe(8); // 10 - 1 - 1
    });

    it('should be safe to call on non-existent entries', () => {
      expect(() => resetAuthRateLimit('nonexistent@example.com', 'passwordReset')).not.toThrow();
    });
  });

  describe('clearAllAuthRateLimits', () => {
    it('should clear all rate limits', async () => {
      // Create multiple entries
      await checkAuthRateLimit('user1@example.com', 'passwordReset');
      await checkAuthRateLimit('user1@example.com', 'passwordReset');
      await checkAuthRateLimit('user2@example.com', 'login');

      // Clear all
      clearAllAuthRateLimits();

      // All should have fresh limits
      const result1 = await checkAuthRateLimit('user1@example.com', 'passwordReset');
      expect(result1.remaining).toBe(4);

      const result2 = await checkAuthRateLimit('user2@example.com', 'login');
      expect(result2.remaining).toBe(9);
    });

    it('should be safe to call when empty', () => {
      expect(() => clearAllAuthRateLimits()).not.toThrow();
    });
  });

  describe('cleanupExpiredAuthEntries', () => {
    it('should remove expired entries', async () => {
      jest.useFakeTimers();

      const identifier = 'test@example.com';

      // Create an entry
      await checkAuthRateLimit(identifier, 'passwordReset');
      await checkAuthRateLimit(identifier, 'passwordReset');

      // Advance time past window
      jest.advanceTimersByTime(60 * 60 * 1000 + 1000);

      // Create a fresh entry that should not be cleaned up
      await checkAuthRateLimit('fresh@example.com', 'passwordReset');

      // Run cleanup
      cleanupExpiredAuthEntries();

      // Old entry should be cleared (fresh start)
      const oldResult = await checkAuthRateLimit(identifier, 'passwordReset');
      expect(oldResult.remaining).toBe(4); // Fresh count

      // New entry should still have count
      const newResult = await checkAuthRateLimit('fresh@example.com', 'passwordReset');
      expect(newResult.remaining).toBe(3); // Already had 1, now 2

      jest.useRealTimers();
    });

    it('should be safe to call when empty', () => {
      clearAllAuthRateLimits();
      expect(() => cleanupExpiredAuthEntries()).not.toThrow();
    });
  });

  describe('getAuthRateLimitStatus', () => {
    it('should return null for new identifier', () => {
      const status = getAuthRateLimitStatus('new@example.com', 'passwordReset');
      expect(status).toBeNull();
    });

    it('should return status without incrementing count', async () => {
      const identifier = 'test@example.com';

      // Make 2 attempts
      await checkAuthRateLimit(identifier, 'passwordReset');
      await checkAuthRateLimit(identifier, 'passwordReset');

      // Check status (should not increment)
      const status1 = getAuthRateLimitStatus(identifier, 'passwordReset');
      expect(status1?.remaining).toBe(3);

      // Check again (should still be same)
      const status2 = getAuthRateLimitStatus(identifier, 'passwordReset');
      expect(status2?.remaining).toBe(3);

      // Make another attempt to verify count wasn't affected
      const result = await checkAuthRateLimit(identifier, 'passwordReset');
      expect(result.remaining).toBe(2); // 5 - 3 = 2
    });

    it('should return null for expired entry', async () => {
      jest.useFakeTimers();

      const identifier = 'test@example.com';

      await checkAuthRateLimit(identifier, 'passwordReset');

      // Advance time past window
      jest.advanceTimersByTime(60 * 60 * 1000 + 1000);

      const status = getAuthRateLimitStatus(identifier, 'passwordReset');
      expect(status).toBeNull();

      jest.useRealTimers();
    });

    it('should include retryAfter when limit exceeded', async () => {
      const identifier = 'test@example.com';

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await checkAuthRateLimit(identifier, 'passwordReset');
      }

      const status = getAuthRateLimitStatus(identifier, 'passwordReset');
      expect(status?.allowed).toBe(false);
      expect(status?.remaining).toBe(0);
      expect(status?.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle empty identifier', async () => {
      const result = await checkAuthRateLimit('', 'passwordReset');
      expect(result.allowed).toBe(true);
    });

    it('should handle special characters in identifier', async () => {
      const specialId = 'user+test@example.com';
      const result = await checkAuthRateLimit(specialId, 'passwordReset');
      expect(result.allowed).toBe(true);
    });

    it('should handle very long identifiers', async () => {
      const longId = 'a'.repeat(1000) + '@example.com';
      const result = await checkAuthRateLimit(longId, 'passwordReset');
      expect(result.allowed).toBe(true);
    });

    it('should handle concurrent requests', async () => {
      const identifier = 'concurrent@example.com';

      // Make 5 concurrent requests
      const promises = Array(5)
        .fill(null)
        .map(() => checkAuthRateLimit(identifier, 'passwordReset'));

      const results = await Promise.all(promises);

      // All should be allowed
      expect(results.every(r => r.allowed)).toBe(true);
      expect(results[results.length - 1].remaining).toBe(0);

      // Next request should be blocked
      const blocked = await checkAuthRateLimit(identifier, 'passwordReset');
      expect(blocked.allowed).toBe(false);
    });

    it('should maintain separate namespaces with operation prefix', async () => {
      const identifier = 'test@example.com';

      // Make attempts with different operations
      await checkAuthRateLimit(identifier, 'passwordReset');
      await checkAuthRateLimit(identifier, 'passwordReset');

      await checkAuthRateLimit(identifier, 'login');

      // Each should have independent counts
      const resetStatus = getAuthRateLimitStatus(identifier, 'passwordReset');
      expect(resetStatus?.remaining).toBe(3); // 5 - 2

      const loginStatus = getAuthRateLimitStatus(identifier, 'login');
      expect(loginStatus?.remaining).toBe(9); // 10 - 1
    });

    it('should handle rapid successive attempts', async () => {
      const identifier = 'rapid@example.com';

      for (let i = 0; i < 10; i++) {
        await checkAuthRateLimit(identifier, 'passwordReset');
      }

      const status = getAuthRateLimitStatus(identifier, 'passwordReset');
      expect(status?.remaining).toBe(0);
      expect(status?.allowed).toBe(false);
    });
  });
});
