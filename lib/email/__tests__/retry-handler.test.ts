/**
 * Unit tests for retry handler
 */

import {
  calculateBackoffMinutes,
  calculateNextRetryTime,
  isReadyForRetry,
  hasExceededMaxRetries,
  shouldMoveToDeadLetter,
  MAX_RETRY_ATTEMPTS,
  BACKOFF_SCHEDULE_MINUTES,
  DEAD_LETTER_STATUS,
} from '../retry-handler';
import type { NotificationLog } from '@/types/notifications';

describe('retry-handler', () => {
  // ============================================================================
  // BACKOFF CALCULATION
  // ============================================================================

  describe('calculateBackoffMinutes', () => {
    it('should return correct backoff for each retry attempt', () => {
      expect(calculateBackoffMinutes(0)).toBe(1); // 1 minute
      expect(calculateBackoffMinutes(1)).toBe(5); // 5 minutes
      expect(calculateBackoffMinutes(2)).toBe(30); // 30 minutes
      expect(calculateBackoffMinutes(3)).toBe(120); // 2 hours
      expect(calculateBackoffMinutes(4)).toBe(1440); // 24 hours
    });

    it('should default to last backoff value for out-of-range retry counts', () => {
      const lastBackoff = BACKOFF_SCHEDULE_MINUTES[BACKOFF_SCHEDULE_MINUTES.length - 1];
      expect(calculateBackoffMinutes(5)).toBe(lastBackoff);
      expect(calculateBackoffMinutes(10)).toBe(lastBackoff);
      expect(calculateBackoffMinutes(100)).toBe(lastBackoff);
    });

    it('should handle negative retry counts', () => {
      expect(calculateBackoffMinutes(-1)).toBe(1);
      expect(calculateBackoffMinutes(-5)).toBe(1);
    });
  });

  describe('calculateNextRetryTime', () => {
    it('should calculate correct next retry time for first attempt', () => {
      const lastAttempt = '2024-01-01T12:00:00Z';
      const nextRetry = calculateNextRetryTime(lastAttempt, 0);

      const expected = new Date('2024-01-01T12:01:00Z').toISOString();
      expect(nextRetry).toBe(expected);
    });

    it('should calculate correct next retry time for second attempt', () => {
      const lastAttempt = '2024-01-01T12:00:00Z';
      const nextRetry = calculateNextRetryTime(lastAttempt, 1);

      const expected = new Date('2024-01-01T12:05:00Z').toISOString();
      expect(nextRetry).toBe(expected);
    });

    it('should calculate correct next retry time for third attempt', () => {
      const lastAttempt = '2024-01-01T12:00:00Z';
      const nextRetry = calculateNextRetryTime(lastAttempt, 2);

      const expected = new Date('2024-01-01T12:30:00Z').toISOString();
      expect(nextRetry).toBe(expected);
    });

    it('should calculate correct next retry time for fourth attempt', () => {
      const lastAttempt = '2024-01-01T12:00:00Z';
      const nextRetry = calculateNextRetryTime(lastAttempt, 3);

      const expected = new Date('2024-01-01T14:00:00Z').toISOString();
      expect(nextRetry).toBe(expected);
    });

    it('should calculate correct next retry time for fifth attempt', () => {
      const lastAttempt = '2024-01-01T12:00:00Z';
      const nextRetry = calculateNextRetryTime(lastAttempt, 4);

      const expected = new Date('2024-01-02T12:00:00Z').toISOString();
      expect(nextRetry).toBe(expected);
    });

    it('should handle different time zones correctly', () => {
      const lastAttempt = '2024-01-01T00:00:00-05:00'; // EST
      const nextRetry = calculateNextRetryTime(lastAttempt, 0);

      // Should add 1 minute regardless of timezone
      const lastDate = new Date(lastAttempt);
      const expectedDate = new Date(lastDate.getTime() + 60000); // +1 minute in ms
      expect(nextRetry).toBe(expectedDate.toISOString());
    });
  });

  // ============================================================================
  // RETRY READINESS
  // ============================================================================

  describe('isReadyForRetry', () => {
    it('should return true when backoff time has passed', () => {
      const notification = {
        retry_count: 0,
        updated_at: '2024-01-01T12:00:00Z',
        status: 'failed' as const,
      };

      const currentTime = new Date('2024-01-01T12:02:00Z'); // 2 minutes later
      expect(isReadyForRetry(notification, currentTime)).toBe(true);
    });

    it('should return false when backoff time has not passed', () => {
      const notification = {
        retry_count: 0,
        updated_at: '2024-01-01T12:00:00Z',
        status: 'failed' as const,
      };

      const currentTime = new Date('2024-01-01T12:00:30Z'); // 30 seconds later
      expect(isReadyForRetry(notification, currentTime)).toBe(false);
    });

    it('should return false for non-failed status', () => {
      const notification = {
        retry_count: 0,
        updated_at: '2024-01-01T12:00:00Z',
        status: 'sent' as const,
      };

      const currentTime = new Date('2024-01-01T12:02:00Z');
      expect(isReadyForRetry(notification, currentTime)).toBe(false);
    });

    it('should handle different retry counts correctly', () => {
      // Second retry (5 minute backoff)
      const notification1 = {
        retry_count: 1,
        updated_at: '2024-01-01T12:00:00Z',
        status: 'failed' as const,
      };

      expect(isReadyForRetry(notification1, new Date('2024-01-01T12:04:00Z'))).toBe(false);
      expect(isReadyForRetry(notification1, new Date('2024-01-01T12:05:00Z'))).toBe(true);
      expect(isReadyForRetry(notification1, new Date('2024-01-01T12:06:00Z'))).toBe(true);

      // Third retry (30 minute backoff)
      const notification2 = {
        retry_count: 2,
        updated_at: '2024-01-01T12:00:00Z',
        status: 'failed' as const,
      };

      expect(isReadyForRetry(notification2, new Date('2024-01-01T12:29:00Z'))).toBe(false);
      expect(isReadyForRetry(notification2, new Date('2024-01-01T12:30:00Z'))).toBe(true);
      expect(isReadyForRetry(notification2, new Date('2024-01-01T13:00:00Z'))).toBe(true);
    });

    it('should use current time by default', () => {
      const notification = {
        retry_count: 0,
        updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        status: 'failed' as const,
      };

      // Should be ready for retry (2 minutes > 1 minute backoff)
      expect(isReadyForRetry(notification)).toBe(true);
    });
  });

  describe('hasExceededMaxRetries', () => {
    it('should return false when retry count is below max', () => {
      expect(hasExceededMaxRetries(0)).toBe(false);
      expect(hasExceededMaxRetries(1)).toBe(false);
      expect(hasExceededMaxRetries(4)).toBe(false);
    });

    it('should return true when retry count equals max', () => {
      expect(hasExceededMaxRetries(MAX_RETRY_ATTEMPTS)).toBe(true);
    });

    it('should return true when retry count exceeds max', () => {
      expect(hasExceededMaxRetries(MAX_RETRY_ATTEMPTS + 1)).toBe(true);
      expect(hasExceededMaxRetries(100)).toBe(true);
    });
  });

  describe('shouldMoveToDeadLetter', () => {
    it('should return true for failed notification with max retries', () => {
      const notification = {
        retry_count: MAX_RETRY_ATTEMPTS,
        status: 'failed' as const,
      };

      expect(shouldMoveToDeadLetter(notification)).toBe(true);
    });

    it('should return true for failed notification exceeding max retries', () => {
      const notification = {
        retry_count: MAX_RETRY_ATTEMPTS + 1,
        status: 'failed' as const,
      };

      expect(shouldMoveToDeadLetter(notification)).toBe(true);
    });

    it('should return false for failed notification below max retries', () => {
      const notification = {
        retry_count: MAX_RETRY_ATTEMPTS - 1,
        status: 'failed' as const,
      };

      expect(shouldMoveToDeadLetter(notification)).toBe(false);
    });

    it('should return false for non-failed notification', () => {
      const notification = {
        retry_count: MAX_RETRY_ATTEMPTS,
        status: 'sent' as const,
      };

      expect(shouldMoveToDeadLetter(notification)).toBe(false);
    });

    it('should return false for pending notification', () => {
      const notification = {
        retry_count: MAX_RETRY_ATTEMPTS,
        status: 'pending' as const,
      };

      expect(shouldMoveToDeadLetter(notification)).toBe(false);
    });
  });

  // ============================================================================
  // CONSTANTS VALIDATION
  // ============================================================================

  describe('constants', () => {
    it('should have correct MAX_RETRY_ATTEMPTS', () => {
      expect(MAX_RETRY_ATTEMPTS).toBe(5);
    });

    it('should have correct BACKOFF_SCHEDULE_MINUTES', () => {
      expect(BACKOFF_SCHEDULE_MINUTES).toEqual([1, 5, 30, 120, 1440]);
    });

    it('should have backoff schedule matching MAX_RETRY_ATTEMPTS', () => {
      expect(BACKOFF_SCHEDULE_MINUTES.length).toBe(MAX_RETRY_ATTEMPTS);
    });

    it('should have correct DEAD_LETTER_STATUS', () => {
      expect(DEAD_LETTER_STATUS).toBe('bounced');
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('should handle exact boundary times for retry readiness', () => {
      const notification = {
        retry_count: 0,
        updated_at: '2024-01-01T12:00:00.000Z',
        status: 'failed' as const,
      };

      const exactBoundary = new Date('2024-01-01T12:01:00.000Z');
      expect(isReadyForRetry(notification, exactBoundary)).toBe(true);

      const justBefore = new Date('2024-01-01T12:00:59.999Z');
      expect(isReadyForRetry(notification, justBefore)).toBe(false);

      const justAfter = new Date('2024-01-01T12:01:00.001Z');
      expect(isReadyForRetry(notification, justAfter)).toBe(true);
    });

    it('should handle very old notifications', () => {
      const notification = {
        retry_count: 0,
        updated_at: '2020-01-01T12:00:00Z', // 4 years ago
        status: 'failed' as const,
      };

      expect(isReadyForRetry(notification)).toBe(true);
    });

    it('should handle maximum backoff time correctly', () => {
      const notification = {
        retry_count: 4, // Last retry (24 hour backoff)
        updated_at: '2024-01-01T12:00:00Z',
        status: 'failed' as const,
      };

      const justBefore24h = new Date('2024-01-02T11:59:59Z');
      expect(isReadyForRetry(notification, justBefore24h)).toBe(false);

      const exactly24h = new Date('2024-01-02T12:00:00Z');
      expect(isReadyForRetry(notification, exactly24h)).toBe(true);

      const after24h = new Date('2024-01-02T13:00:00Z');
      expect(isReadyForRetry(notification, after24h)).toBe(true);
    });
  });
});
