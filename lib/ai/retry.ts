/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Retry Logic with Exponential Backoff
 *
 * Utility for retrying failed operations with configurable backoff strategy
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[]; // Error codes/messages that should trigger retry
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'timeout',
    'rate limit',
    '429',
    '500',
    '502',
    '503',
    '504',
  ],
};

/**
 * Check if an error is retryable based on configuration
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  if (!config.retryableErrors || config.retryableErrors.length === 0) {
    return true; // Retry all errors if no specific errors defined
  }

  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || error?.status || '';

  return config.retryableErrors.some(
    (retryable) =>
      errorMessage.toLowerCase().includes(retryable.toLowerCase()) ||
      String(errorCode).toLowerCase().includes(retryable.toLowerCase())
  );
}

/**
 * Calculate delay for next retry using exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @returns Promise resolving to function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, config)) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, config);
      console.log(
        `[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed. Retrying in ${Math.round(
          delay
        )}ms...`,
        error instanceof Error ? error.message : error
      );

      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Retry configuration for AI provider requests
 */
export const AI_PROVIDER_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 8000,
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'timeout',
    'rate limit',
    '429',
    '500',
    '502',
    '503',
    '504',
    'Request timeout',
    'Failed to connect',
  ],
};

/**
 * Retry configuration for database operations
 */
export const DATABASE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  retryableErrors: ['PGRST', 'connection', 'timeout'],
};
