/**
 * Rate Limiter for Authentication Operations
 *
 * Implements in-memory rate limiting to prevent abuse of auth endpoints
 * Specifically designed for password reset and other security-sensitive operations
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstAttempt: number;
}

// In-memory store for rate limits
// NOTE: In production with multiple servers, consider using Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
export interface AuthRateLimiterConfig {
  maxAttempts: number; // Maximum attempts allowed
  windowMs: number; // Time window in milliseconds
}

/**
 * Default rate limit configurations for auth operations
 */
export const AUTH_RATE_LIMITS = {
  passwordReset: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 5 attempts per hour
  },
  login: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 10 attempts per 15 minutes
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 3 attempts per hour
  },
} as const;

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // Seconds until next attempt is allowed
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address, email, or combination)
 * @param operation - Type of auth operation (passwordReset, login, signup)
 * @returns Rate limit result
 */
export async function checkAuthRateLimit(
  identifier: string,
  operation: keyof typeof AUTH_RATE_LIMITS
): Promise<RateLimitResult> {
  const config = AUTH_RATE_LIMITS[operation];
  const key = `auth:${operation}:${identifier}`;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or window has expired
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      firstAttempt: now,
    };
    rateLimitStore.set(key, newEntry);

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > config.maxAttempts) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Update entry
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific identifier and operation
 * Useful for clearing limits after successful verification
 */
export function resetAuthRateLimit(
  identifier: string,
  operation: keyof typeof AUTH_RATE_LIMITS
): void {
  const key = `auth:${operation}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearAllAuthRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Clean up expired rate limit entries
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredAuthEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get current rate limit status without incrementing
 * Useful for checking limits before expensive operations
 */
export function getAuthRateLimitStatus(
  identifier: string,
  operation: keyof typeof AUTH_RATE_LIMITS
): RateLimitResult | null {
  const config = AUTH_RATE_LIMITS[operation];
  const key = `auth:${operation}:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now > entry.resetTime) {
    return null;
  }

  const remaining = Math.max(0, config.maxAttempts - entry.count);
  const retryAfter = entry.count >= config.maxAttempts
    ? Math.ceil((entry.resetTime - now) / 1000)
    : undefined;

  return {
    allowed: entry.count < config.maxAttempts,
    remaining,
    resetTime: entry.resetTime,
    retryAfter,
  };
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredAuthEntries, 10 * 60 * 1000);
}
