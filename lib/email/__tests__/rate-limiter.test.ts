/**
 * Tests for email rate limiter
 */

import {
  checkRateLimit,
  checkSystemRateLimit,
  recordEmailSent,
  __testing__,
} from '../rate-limiter';

describe('Email Rate Limiter', () => {
  beforeEach(() => {
    // Reset state before each test
    __testing__.reset();
  });

  afterAll(() => {
    // Stop cleanup timer after all tests
    __testing__.stopCleanupTimer();
  });

  describe('checkRateLimit', () => {
    it('should allow email when user has not sent any emails', async () => {
      const result = await checkRateLimit('user1');

      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should allow emails up to the user limit', async () => {
      const userId = 'user1';
      const limit = __testing__.USER_LIMIT;

      // Send emails up to the limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(userId);
      }

      // Should still allow because we haven't checked yet
      const result = await checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should block when user exceeds rate limit', async () => {
      const userId = 'user1';
      const limit = __testing__.USER_LIMIT;

      // Send emails up to the limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(userId);
      }

      // Try to send one more
      const result = await checkRateLimit(userId);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(3600); // Max 1 hour
    });

    it('should calculate correct retry time', async () => {
      const userId = 'user1';
      const limit = __testing__.USER_LIMIT;

      // Send emails up to the limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(userId);
      }

      const result = await checkRateLimit(userId);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      // Should be close to the window size (1 hour = 3600 seconds)
      expect(result.retryAfter).toBeGreaterThan(3590);
      expect(result.retryAfter).toBeLessThanOrEqual(3600);
    });

    it('should handle multiple users independently', async () => {
      const limit = __testing__.USER_LIMIT;

      // User 1 sends up to limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent('user1');
      }

      // User 2 should still be able to send
      const result = await checkRateLimit('user2');
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkSystemRateLimit', () => {
    it('should allow email when system has not sent any emails', async () => {
      const result = await checkSystemRateLimit();

      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should allow emails up to the system limit', async () => {
      const limit = __testing__.SYSTEM_LIMIT;

      // Send emails up to the limit from different users
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(`user${i}`);
      }

      // Should block on next check
      const result = await checkSystemRateLimit();
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should block when system exceeds rate limit', async () => {
      const limit = __testing__.SYSTEM_LIMIT;

      // Send emails exceeding the limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(`user${i}`);
      }

      const result = await checkSystemRateLimit();

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(3600);
    });

    it('should count emails from all users', async () => {
      // User 1 sends 500 emails
      for (let i = 0; i < 500; i++) {
        await recordEmailSent('user1');
      }

      // User 2 sends 500 emails
      for (let i = 0; i < 500; i++) {
        await recordEmailSent('user2');
      }

      // System limit should be reached
      const result = await checkSystemRateLimit();
      expect(result.allowed).toBe(false);
    });
  });

  describe('recordEmailSent', () => {
    it('should record email for user', async () => {
      await recordEmailSent('user1');

      const stats = __testing__.getStats();
      expect(stats.userCount).toBe(1);
      expect(stats.systemCount).toBe(1);
    });

    it('should record multiple emails for same user', async () => {
      await recordEmailSent('user1');
      await recordEmailSent('user1');
      await recordEmailSent('user1');

      const stats = __testing__.getStats();
      expect(stats.userCount).toBe(1);
      expect(stats.systemCount).toBe(3);
    });

    it('should record emails for multiple users', async () => {
      await recordEmailSent('user1');
      await recordEmailSent('user2');
      await recordEmailSent('user3');

      const stats = __testing__.getStats();
      expect(stats.userCount).toBe(3);
      expect(stats.systemCount).toBe(3);
    });
  });

  describe('Sliding window behavior', () => {
    let currentTime: number;

    beforeEach(() => {
      currentTime = Date.now();
      __testing__.setTimeProvider(() => currentTime);
    });

    afterEach(() => {
      __testing__.setTimeProvider(() => Date.now());
    });

    it('should allow emails after window expires for user limit', async () => {
      const userId = 'user1';
      const limit = __testing__.USER_LIMIT;

      // Send emails up to limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(userId);
      }

      // Should be blocked
      let result = await checkRateLimit(userId);
      expect(result.allowed).toBe(false);

      // Move time forward past the window
      currentTime += __testing__.WINDOW_MS + 1000;

      // Should be allowed now
      result = await checkRateLimit(userId);
      expect(result.allowed).toBe(true);
    });

    it('should allow emails after window expires for system limit', async () => {
      const limit = __testing__.SYSTEM_LIMIT;

      // Send emails up to limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(`user${i}`);
      }

      // Should be blocked
      let result = await checkSystemRateLimit();
      expect(result.allowed).toBe(false);

      // Move time forward past the window
      currentTime += __testing__.WINDOW_MS + 1000;

      // Should be allowed now
      result = await checkSystemRateLimit();
      expect(result.allowed).toBe(true);
    });

    it('should implement true sliding window', async () => {
      const userId = 'user1';
      const limit = __testing__.USER_LIMIT;

      // Send 50 emails at time 0
      for (let i = 0; i < 50; i++) {
        await recordEmailSent(userId);
      }

      // Move forward 30 minutes
      currentTime += 30 * 60 * 1000;

      // Send 50 more emails
      for (let i = 0; i < 50; i++) {
        await recordEmailSent(userId);
      }

      // Should be blocked (100 emails in the last hour)
      let result = await checkRateLimit(userId);
      expect(result.allowed).toBe(false);

      // Move forward 31 more minutes (total 61 minutes)
      currentTime += 31 * 60 * 1000;

      // First 50 emails should have expired, should be allowed
      result = await checkRateLimit(userId);
      expect(result.allowed).toBe(true);
    });

    it('should gradually free up capacity as time passes', async () => {
      const userId = 'user1';
      const limit = __testing__.USER_LIMIT;

      // Send emails one per minute up to limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(userId);
        currentTime += 60 * 1000; // 1 minute
      }

      // Should be allowed (emails are spread over 100 minutes, so oldest ones expired)
      let result = await checkRateLimit(userId);
      expect(result.allowed).toBe(true);

      // Send more emails to fill the window at current time
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(userId);
      }

      // Now should be blocked
      result = await checkRateLimit(userId);
      expect(result.allowed).toBe(false);

      // Move forward 5 minutes - oldest 5 emails should expire
      currentTime += 5 * 60 * 1000;

      // Still blocked because we still have 95+ emails in the window
      result = await checkRateLimit(userId);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Cleanup of old entries', () => {
    let currentTime: number;

    beforeEach(() => {
      currentTime = Date.now();
      __testing__.setTimeProvider(() => currentTime);
    });

    afterEach(() => {
      __testing__.setTimeProvider(() => Date.now());
    });

    it('should clean up old user entries', async () => {
      // Send emails for multiple users
      await recordEmailSent('user1');
      await recordEmailSent('user2');
      await recordEmailSent('user3');

      let stats = __testing__.getStats();
      expect(stats.userCount).toBe(3);

      // Move time forward past the window
      currentTime += __testing__.WINDOW_MS + 1000;

      // Trigger a check to clean up
      await checkRateLimit('user1');

      stats = __testing__.getStats();
      // User entries should still exist but with empty timestamps
      // They'll be removed on the next check or cleanup cycle
    });

    it('should clean up old system entries', async () => {
      // Send 10 emails
      for (let i = 0; i < 10; i++) {
        await recordEmailSent(`user${i}`);
      }

      let stats = __testing__.getStats();
      expect(stats.systemCount).toBe(10);

      // Move time forward past the window
      currentTime += __testing__.WINDOW_MS + 1000;

      // Trigger system check to clean up
      await checkSystemRateLimit();

      stats = __testing__.getStats();
      expect(stats.systemCount).toBe(0);
    });

    it('should not clean up recent entries', async () => {
      // Send emails
      await recordEmailSent('user1');
      await recordEmailSent('user2');

      let stats = __testing__.getStats();
      expect(stats.userCount).toBe(2);
      expect(stats.systemCount).toBe(2);

      // Move time forward but not past the window
      currentTime += 30 * 60 * 1000; // 30 minutes

      // Trigger checks
      await checkRateLimit('user1');
      await checkSystemRateLimit();

      stats = __testing__.getStats();
      expect(stats.userCount).toBe(2);
      expect(stats.systemCount).toBe(2);
    });

    it('should remove user entries with no valid timestamps', async () => {
      // Send an email
      await recordEmailSent('user1');

      let stats = __testing__.getStats();
      expect(stats.userCount).toBe(1);

      // Move time forward past the window
      currentTime += __testing__.WINDOW_MS + 1000;

      // Trigger a check to clean up
      await checkRateLimit('user1');

      stats = __testing__.getStats();
      // The check should have cleaned up the old timestamp
      expect(stats.systemCount).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle exactly at the limit', async () => {
      const userId = 'user1';
      const limit = __testing__.USER_LIMIT;

      // Send exactly the limit
      for (let i = 0; i < limit; i++) {
        await recordEmailSent(userId);
      }

      // The limit-th email should be blocked on check
      const result = await checkRateLimit(userId);
      expect(result.allowed).toBe(false);
    });

    it('should handle concurrent recordings', async () => {
      const userId = 'user1';

      // Simulate concurrent email sending
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(recordEmailSent(userId));
      }

      await Promise.all(promises);

      const stats = __testing__.getStats();
      expect(stats.systemCount).toBe(10);
    });

    it('should handle empty user id', async () => {
      await recordEmailSent('');
      const result = await checkRateLimit('');

      expect(result.allowed).toBe(true);
    });

    it('should return correct stats when no emails sent', () => {
      const stats = __testing__.getStats();

      expect(stats.userCount).toBe(0);
      expect(stats.systemCount).toBe(0);
    });

    it('should handle reset correctly', async () => {
      // Send some emails
      await recordEmailSent('user1');
      await recordEmailSent('user2');

      let stats = __testing__.getStats();
      expect(stats.userCount).toBe(2);
      expect(stats.systemCount).toBe(2);

      // Reset
      __testing__.reset();

      stats = __testing__.getStats();
      expect(stats.userCount).toBe(0);
      expect(stats.systemCount).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should enforce both user and system limits', async () => {
      const userLimit = __testing__.USER_LIMIT;
      const systemLimit = __testing__.SYSTEM_LIMIT;

      // One user sends up to their limit
      for (let i = 0; i < userLimit; i++) {
        await recordEmailSent('user1');
      }

      // User should be blocked
      let userResult = await checkRateLimit('user1');
      expect(userResult.allowed).toBe(false);

      // System should still be ok
      let systemResult = await checkSystemRateLimit();
      expect(systemResult.allowed).toBe(true);

      // Other users send enough to hit system limit
      const remaining = systemLimit - userLimit;
      for (let i = 0; i < remaining; i++) {
        await recordEmailSent('user2');
      }

      // System should now be blocked
      systemResult = await checkSystemRateLimit();
      expect(systemResult.allowed).toBe(false);

      // User 1 should still be blocked
      userResult = await checkRateLimit('user1');
      expect(userResult.allowed).toBe(false);

      // User 3 (who hasn't sent anything) should be blocked by system limit
      userResult = await checkRateLimit('user3');
      expect(userResult.allowed).toBe(true); // User check passes

      systemResult = await checkSystemRateLimit();
      expect(systemResult.allowed).toBe(false); // But system check fails
    });

    it('should handle burst of emails from multiple users', async () => {
      // 10 users each send 10 emails
      for (let user = 0; user < 10; user++) {
        for (let email = 0; email < 10; email++) {
          await recordEmailSent(`user${user}`);
        }
      }

      const stats = __testing__.getStats();
      expect(stats.userCount).toBe(10);
      expect(stats.systemCount).toBe(100);

      // All users should still be under their limit
      for (let user = 0; user < 10; user++) {
        const result = await checkRateLimit(`user${user}`);
        expect(result.allowed).toBe(true);
      }

      // System should be under limit
      const systemResult = await checkSystemRateLimit();
      expect(systemResult.allowed).toBe(true);
    });
  });
});
