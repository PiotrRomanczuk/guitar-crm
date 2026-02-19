/**
 * AI Request Queue Manager
 *
 * Manages concurrent AI requests per user to prevent overload
 * and provide better user experience
 */

/**
 * Queue item representing a pending AI request
 */
interface QueueItem<T> {
  id: string;
  userId: string;
  agentId: string;
  params: T;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  signal?: AbortSignal;
  timestamp: number;
}

/**
 * Active request tracking
 */
interface ActiveRequest {
  id: string;
  userId: string;
  agentId: string;
  startTime: number;
}

/**
 * Queue manager configuration
 */
export interface QueueConfig {
  maxConcurrentPerUser: number;
  maxQueueSize: number;
  requestTimeout: number; // ms
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrentPerUser: 2,
  maxQueueSize: 5,
  requestTimeout: 60000, // 1 minute
};

/**
 * Queue statistics
 */
export interface QueueStats {
  queuedRequests: number;
  activeRequests: number;
  position?: number;
}

// Storage
const queues = new Map<string, QueueItem<unknown>[]>();
const activeRequests = new Map<string, ActiveRequest[]>();

/**
 * Get user-specific queue
 */
function getUserQueue(userId: string): QueueItem<unknown>[] {
  if (!queues.has(userId)) {
    queues.set(userId, []);
  }
  return queues.get(userId)!;
}

/**
 * Get user's active requests
 */
function getUserActiveRequests(userId: string): ActiveRequest[] {
  if (!activeRequests.has(userId)) {
    activeRequests.set(userId, []);
  }
  return activeRequests.get(userId)!;
}

/**
 * Check if user can start a new request
 */
function canStartRequest(userId: string, config: QueueConfig): boolean {
  const active = getUserActiveRequests(userId);
  return active.length < config.maxConcurrentPerUser;
}

/**
 * Get queue position for a request
 */
function getQueuePosition(userId: string, requestId: string): number {
  const queue = getUserQueue(userId);
  const index = queue.findIndex((item) => item.id === requestId);
  return index === -1 ? -1 : index + 1;
}

/**
 * Get queue statistics for a user
 */
export function getQueueStats(userId: string, requestId?: string): QueueStats {
  const queue = getUserQueue(userId);
  const active = getUserActiveRequests(userId);

  return {
    queuedRequests: queue.length,
    activeRequests: active.length,
    position: requestId ? getQueuePosition(userId, requestId) : undefined,
  };
}

/**
 * Process next queued request for a user
 */
async function processNextRequest(userId: string, config: QueueConfig): Promise<void> {
  if (!canStartRequest(userId, config)) {
    return;
  }

  const queue = getUserQueue(userId);
  const nextItem = queue.shift();

  if (!nextItem) {
    return;
  }

  // Check if request was cancelled
  if (nextItem.signal?.aborted) {
    nextItem.reject(new Error('Request cancelled'));
    // Try next item
    processNextRequest(userId, config);
    return;
  }

  // Add to active requests
  const activeRequest: ActiveRequest = {
    id: nextItem.id,
    userId: nextItem.userId,
    agentId: nextItem.agentId,
    startTime: Date.now(),
  };

  const active = getUserActiveRequests(userId);
  active.push(activeRequest);

  // Set timeout
  const timeoutId = setTimeout(() => {
    completeRequest(userId, nextItem.id);
    nextItem.reject(new Error('Request timeout'));
  }, config.requestTimeout);

  try {
    // Execute the request
    // This is a placeholder - actual execution happens in the caller
    nextItem.resolve(nextItem.params);
  } catch (error) {
    nextItem.reject(error as Error);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Complete a request and process next in queue
 */
function completeRequest(userId: string, requestId: string, config = DEFAULT_CONFIG): void {
  const active = getUserActiveRequests(userId);
  const index = active.findIndex((req) => req.id === requestId);

  if (index !== -1) {
    active.splice(index, 1);
  }

  // Process next queued request
  processNextRequest(userId, config);
}

/**
 * Enqueue an AI request
 *
 * @param userId - User identifier
 * @param agentId - Agent identifier
 * @param params - Request parameters
 * @param signal - Optional AbortSignal
 * @param config - Optional queue configuration
 * @returns Promise that resolves when request can be executed
 */
export function enqueueRequest<T>(
  userId: string,
  agentId: string,
  params: T,
  signal?: AbortSignal,
  config: QueueConfig = DEFAULT_CONFIG
): Promise<{ requestId: string; canExecute: boolean }> {
  const requestId = `${userId}-${agentId}-${Date.now()}-${Math.random()}`;

  return new Promise((resolve, reject) => {
    // Check if can start immediately
    if (canStartRequest(userId, config)) {
      // Add to active requests
      const activeRequest: ActiveRequest = {
        id: requestId,
        userId,
        agentId,
        startTime: Date.now(),
      };

      const active = getUserActiveRequests(userId);
      active.push(activeRequest);

      resolve({ requestId, canExecute: true });
      return;
    }

    // Check queue size
    const queue = getUserQueue(userId);
    if (queue.length >= config.maxQueueSize) {
      reject(
        new Error(
          `Queue full. Maximum ${config.maxQueueSize} requests can be queued. Please try again later.`
        )
      );
      return;
    }

    // Add to queue
    const queueItem: QueueItem<T> = {
      id: requestId,
      userId,
      agentId,
      params,
      resolve: () => resolve({ requestId, canExecute: true }),
      reject,
      signal,
      timestamp: Date.now(),
    };

    queue.push(queueItem);

    // Return immediately with queued status
    resolve({ requestId, canExecute: false });
  });
}

/**
 * Mark a request as complete
 *
 * @param userId - User identifier
 * @param requestId - Request identifier
 */
export function markRequestComplete(userId: string, requestId: string): void {
  completeRequest(userId, requestId);
}

/**
 * Cancel a queued request
 *
 * @param userId - User identifier
 * @param requestId - Request identifier
 * @returns true if request was cancelled, false if not found
 */
export function cancelQueuedRequest(userId: string, requestId: string): boolean {
  const queue = getUserQueue(userId);
  const index = queue.findIndex((item) => item.id === requestId);

  if (index !== -1) {
    const item = queue.splice(index, 1)[0];
    item.reject(new Error('Request cancelled'));
    return true;
  }

  return false;
}

/**
 * Clear all requests for a user
 *
 * @param userId - User identifier
 */
export function clearUserQueue(userId: string): void {
  const queue = getUserQueue(userId);

  // Reject all queued requests
  queue.forEach((item) => {
    item.reject(new Error('Queue cleared'));
  });

  queue.length = 0;
  activeRequests.delete(userId);
  queues.delete(userId);
}

/**
 * Get formatted queue message for UI
 *
 * @param stats - Queue statistics
 * @returns User-friendly message
 */
export function getQueueMessage(stats: QueueStats): string | undefined {
  if (stats.queuedRequests === 0) {
    return undefined;
  }

  if (stats.position !== undefined) {
    const ahead = stats.position - 1;
    if (ahead === 0) {
      return 'Next in queue...';
    }
    return `${ahead} request${ahead === 1 ? '' : 's'} ahead in queue`;
  }

  return `${stats.queuedRequests} request${stats.queuedRequests === 1 ? '' : 's'} in queue`;
}

/**
 * Cleanup old queued requests (older than timeout)
 */
export function cleanupExpiredRequests(): void {
  const now = Date.now();

  for (const [userId, queue] of queues.entries()) {
    const filtered = queue.filter((item) => {
      const age = now - item.timestamp;
      if (age > DEFAULT_CONFIG.requestTimeout) {
        item.reject(new Error('Request expired'));
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      queues.delete(userId);
    } else {
      queues.set(userId, filtered);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRequests, 60000);
}
