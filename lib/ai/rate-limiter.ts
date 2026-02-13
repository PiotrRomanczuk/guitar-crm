/**
 * Rate Limiter for AI Agent Requests
 *
 * Implements in-memory rate limiting to prevent abuse and control costs
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits (consider Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
  keyPrefix?: string; // Optional prefix for rate limit keys
}

/**
 * Default rate limit configurations by user role
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimiterConfig> = {
  admin: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
  teacher: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 50 requests per minute
  },
  student: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },
  anonymous: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },
};

/**
 * Check if a request should be rate limited
 *
 * @param userId - User identifier
 * @param userRole - User role for determining limits
 * @param agentId - Optional agent ID for specific limits
 * @returns Object with allowed status and retry information
 */
export async function checkRateLimit(
  userId: string,
  userRole: 'admin' | 'teacher' | 'student' | 'anonymous',
  agentId?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  message?: string;
  limit: number;
}> {
  const config = DEFAULT_RATE_LIMITS[userRole] || DEFAULT_RATE_LIMITS.anonymous;
  const key = agentId ? `${userId}:${agentId}` : userId;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or window has expired
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
      limit: config.maxRequests,
      message: `${config.maxRequests - 1} requests remaining`,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
    const retryMessage = retryAfterSeconds < 60
      ? `${retryAfterSeconds} seconds`
      : `${Math.ceil(retryAfterSeconds / 60)} minutes`;

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: retryAfterSeconds,
      limit: config.maxRequests,
      message: `Rate limit exceeded. Try again in ${retryMessage}.`,
    };
  }

  // Update entry
  rateLimitStore.set(key, entry);

  const remaining = config.maxRequests - entry.count;
  let message: string | undefined;

  // Show warning when getting close to limit
  if (remaining <= 5) {
    message = `${remaining} request${remaining === 1 ? '' : 's'} remaining`;
  }

  return {
    allowed: true,
    remaining,
    resetTime: entry.resetTime,
    limit: config.maxRequests,
    message,
  };
}

/**
 * Reset rate limit for a specific user/agent
 */
export function resetRateLimit(userId: string, agentId?: string): void {
  const key = agentId ? `${userId}:${agentId}` : userId;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Clean up expired rate limit entries
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
