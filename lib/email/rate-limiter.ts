/**
 * Rate limiter for email sending using sliding window algorithm
 *
 * Limits:
 * - 100 emails/hour per user
 * - 1000 emails/hour system-wide
 *
 * Uses in-memory Map for storage (can be upgraded to Redis for production)
 */

import {
  logRateLimitExceeded,
  logDebug,
} from '@/lib/logging/notification-logger';

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

const USER_LIMIT = 100; // emails per hour per user
const SYSTEM_LIMIT = 1000; // emails per hour system-wide
const WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up every 5 minutes

class EmailRateLimiter {
  private userLimits: Map<string, RateLimitEntry> = new Map();
  private systemLimits: number[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;
  private getNow: () => number = () => Date.now();

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Set custom time provider (for testing)
   */
  setTimeProvider(getNow: () => number): void {
    this.getNow = getNow;
  }

  /**
   * Check if a user has exceeded their rate limit
   */
  async checkRateLimit(userId: string): Promise<RateLimitResult> {
    const now = this.getNow();
    const userEntry = this.userLimits.get(userId);

    if (!userEntry) {
      return { allowed: true };
    }

    // Remove timestamps outside the window
    const validTimestamps = userEntry.timestamps.filter(
      (ts) => now - ts < WINDOW_MS
    );

    if (validTimestamps.length < USER_LIMIT) {
      return { allowed: true };
    }

    // Calculate when the oldest timestamp will expire
    const oldestTimestamp = validTimestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000);

    logRateLimitExceeded(userId, 'user', retryAfter, {
      current_count: validTimestamps.length,
      limit: USER_LIMIT,
    });

    return {
      allowed: false,
      retryAfter,
    };
  }

  /**
   * Check if the system-wide rate limit has been exceeded
   */
  async checkSystemRateLimit(): Promise<RateLimitResult> {
    const now = this.getNow();

    // Remove timestamps outside the window
    const validTimestamps = this.systemLimits.filter(
      (ts) => now - ts < WINDOW_MS
    );

    this.systemLimits = validTimestamps;

    if (validTimestamps.length < SYSTEM_LIMIT) {
      return { allowed: true };
    }

    // Calculate when the oldest timestamp will expire
    const oldestTimestamp = validTimestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000);

    logRateLimitExceeded('system', 'system', retryAfter, {
      current_count: validTimestamps.length,
      limit: SYSTEM_LIMIT,
    });

    return {
      allowed: false,
      retryAfter,
    };
  }

  /**
   * Record that an email was sent
   */
  async recordEmailSent(userId: string): Promise<void> {
    const now = this.getNow();

    // Record for user limit
    const userEntry = this.userLimits.get(userId);
    if (userEntry) {
      userEntry.timestamps.push(now);
    } else {
      this.userLimits.set(userId, { timestamps: [now] });
    }

    // Record for system limit
    this.systemLimits.push(now);

    logDebug('Email sent recorded for rate limiting', {
      user_id: userId,
      user_count: this.userLimits.get(userId)?.timestamps.length || 0,
      system_count: this.systemLimits.length,
    });
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = this.getNow();

    // Clean up user limits
    for (const [userId, entry] of this.userLimits.entries()) {
      const validTimestamps = entry.timestamps.filter(
        (ts) => now - ts < WINDOW_MS
      );

      if (validTimestamps.length === 0) {
        // Remove empty entries
        this.userLimits.delete(userId);
      } else {
        entry.timestamps = validTimestamps;
      }
    }

    // Clean up system limits
    this.systemLimits = this.systemLimits.filter(
      (ts) => now - ts < WINDOW_MS
    );
  }

  /**
   * Start the periodic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL_MS);

    // Prevent the timer from keeping the process alive
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop the cleanup timer (useful for testing)
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Reset all rate limits (useful for testing)
   */
  reset(): void {
    this.userLimits.clear();
    this.systemLimits = [];
  }

  /**
   * Get current stats (useful for monitoring)
   */
  getStats(): {
    userCount: number;
    systemCount: number;
  } {
    const now = this.getNow();

    // Count valid user entries
    let totalUserEmails = 0;
    for (const entry of this.userLimits.values()) {
      const validTimestamps = entry.timestamps.filter(
        (ts) => now - ts < WINDOW_MS
      );
      totalUserEmails += validTimestamps.length;
    }

    // Count valid system entries
    const validSystemTimestamps = this.systemLimits.filter(
      (ts) => now - ts < WINDOW_MS
    );

    return {
      userCount: this.userLimits.size,
      systemCount: validSystemTimestamps.length,
    };
  }
}

// Singleton instance
let rateLimiterInstance: EmailRateLimiter | null = null;

/**
 * Get the rate limiter singleton instance
 */
function getRateLimiter(): EmailRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new EmailRateLimiter();
  }
  return rateLimiterInstance;
}

// Export the public API
export const checkRateLimit = (userId: string): Promise<RateLimitResult> => {
  return getRateLimiter().checkRateLimit(userId);
};

export const checkSystemRateLimit = (): Promise<RateLimitResult> => {
  return getRateLimiter().checkSystemRateLimit();
};

export const recordEmailSent = (userId: string): Promise<void> => {
  return getRateLimiter().recordEmailSent(userId);
};

// Export for testing
export const __testing__ = {
  reset: () => getRateLimiter().reset(),
  stopCleanupTimer: () => getRateLimiter().stopCleanupTimer(),
  getStats: () => getRateLimiter().getStats(),
  setTimeProvider: (getNow: () => number) => getRateLimiter().setTimeProvider(getNow),
  USER_LIMIT,
  SYSTEM_LIMIT,
  WINDOW_MS,
};
