'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  estimateTokens,
  getExpectedTokenCount,
  calculateProgress,
  getEstimationSummary,
} from '@/lib/ai/token-estimation';
import {
  startStreamingSession,
  recordFirstToken,
  updateTokenCount,
  completeStreamingSession,
} from '@/lib/ai/streaming-analytics';
import {
  enqueueRequest,
  markRequestComplete,
  getQueueStats,
  getQueueMessage,
} from '@/lib/ai/queue-manager';

/**
 * Streaming status states
 */
export type AIStreamStatus =
  | 'idle'
  | 'queued'
  | 'connecting'
  | 'streaming'
  | 'complete'
  | 'error'
  | 'cancelled';

/**
 * Options for the useAIStream hook
 */
export interface UseAIStreamOptions<T> {
  /** Callback when a chunk is received */
  onChunk?: (content: string) => void;
  /** Callback when streaming completes successfully */
  onComplete?: (finalContent: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when streaming is cancelled */
  onCancel?: () => void;
  /** Optional parameters to pass to the server action */
  params?: T;
  /** Agent ID for analytics and queue management */
  agentId?: string;
  /** Model ID for token estimation */
  modelId?: string;
  /** User ID for queue management */
  userId?: string;
  /** Enable queue management (default: true) */
  enableQueue?: boolean;
  /** Enable analytics tracking (default: true) */
  enableAnalytics?: boolean;
}

/**
 * Hook for managing AI streaming state and lifecycle
 *
 * Provides a clean interface for streaming AI responses with:
 * - State machine: idle → connecting → streaming → complete/error
 * - AbortController management for cancellation
 * - Callbacks for chunk processing, completion, and errors
 * - Token counting and reasoning extraction
 *
 * @example
 * ```tsx
 * const aiStream = useAIStream(generateAIResponseStream, {
 *   onChunk: (content) => setResponse(content),
 *   onComplete: () => toast.success('Complete!'),
 * });
 *
 * await aiStream.start({ prompt: 'Hello!' });
 * ```
 */
export function useAIStream<T = Record<string, unknown>>(
  streamAction: (params: T, signal?: AbortSignal) => AsyncGenerator<string, void, undefined>,
  options: UseAIStreamOptions<T> = {}
) {
  const [status, setStatus] = useState<AIStreamStatus>('idle');
  const [content, setContent] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [queuePosition, setQueuePosition] = useState<number | undefined>(undefined);
  const [queueMessage, setQueueMessage] = useState<string | undefined>(undefined);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * Start streaming with the provided parameters
   */
  const start = useCallback(
    async (params: T) => {
      // Prevent multiple simultaneous streams
      if (isStreamingRef.current) {
        console.warn('[useAIStream] Already streaming, ignoring start request');
        return;
      }

      // Reset state
      setStatus('connecting');
      setContent('');
      setReasoning('');
      setTokenCount(0);
      setError(null);
      setProgress(0);
      setQueuePosition(undefined);
      setQueueMessage(undefined);
      isStreamingRef.current = true;
      startTimeRef.current = Date.now();

      // Set expected token count for progress calculation
      if (options.agentId) {
        const expected = getExpectedTokenCount(options.agentId);
        setEstimatedTotal(expected);
      }

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // Queue management (if enabled)
        if (options.enableQueue !== false && options.userId && options.agentId) {
          const queueResult = await enqueueRequest(
            options.userId,
            options.agentId,
            params,
            abortControllerRef.current.signal
          );

          requestIdRef.current = queueResult.requestId;

          if (!queueResult.canExecute) {
            // Request is queued
            setStatus('queued');
            const stats = getQueueStats(options.userId, queueResult.requestId);
            setQueuePosition(stats.position);
            setQueueMessage(getQueueMessage(stats));

            // Wait for queue to process
            // In a real implementation, you'd poll or use a callback
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Start analytics tracking (if enabled)
        if (options.enableAnalytics !== false && options.userId && options.agentId) {
          const sessionId = `${options.userId}-${Date.now()}`;
          sessionIdRef.current = sessionId;
          startStreamingSession(
            sessionId,
            options.agentId,
            options.modelId || 'unknown',
            options.userId
          );
        }

        // Merge params with options
        const mergedParams = { ...options.params, ...params } as T;

        // Start streaming
        const stream = streamAction(mergedParams, abortControllerRef.current.signal);
        setStatus('streaming');
        setQueuePosition(undefined);
        setQueueMessage(undefined);

        let finalContent = '';
        let firstTokenRecorded = false;

        for await (const chunk of stream) {
          // Check if cancelled
          if (abortControllerRef.current?.signal.aborted) {
            setStatus('cancelled');

            // Complete analytics
            if (sessionIdRef.current) {
              completeStreamingSession(sessionIdRef.current, 'cancelled');
            }

            // Mark queue request complete
            if (requestIdRef.current && options.userId) {
              markRequestComplete(options.userId, requestIdRef.current);
            }

            options.onCancel?.();
            return;
          }

          // Record first token (for TTFT)
          if (!firstTokenRecorded && sessionIdRef.current) {
            recordFirstToken(sessionIdRef.current);
            firstTokenRecorded = true;
          }

          // Update content
          finalContent = chunk;
          setContent(chunk);

          // Estimate token count
          const tokens = estimateTokens(chunk, options.modelId);
          setTokenCount(tokens);

          // Update analytics
          if (sessionIdRef.current) {
            updateTokenCount(sessionIdRef.current, tokens);
          }

          // Calculate progress
          if (estimatedTotal > 0) {
            const currentProgress = calculateProgress(tokens, estimatedTotal);
            setProgress(currentProgress);
          }

          // Trigger chunk callback
          options.onChunk?.(chunk);
        }

        // Streaming complete
        setStatus('complete');
        setProgress(100);

        // Complete analytics
        if (sessionIdRef.current) {
          completeStreamingSession(sessionIdRef.current, 'complete');
        }

        // Mark queue request complete
        if (requestIdRef.current && options.userId) {
          markRequestComplete(options.userId, requestIdRef.current);
        }

        options.onComplete?.(finalContent);
      } catch (err) {
        // Check if error is due to cancellation
        if (abortControllerRef.current?.signal.aborted) {
          setStatus('cancelled');

          if (sessionIdRef.current) {
            completeStreamingSession(sessionIdRef.current, 'cancelled');
          }

          if (requestIdRef.current && options.userId) {
            markRequestComplete(options.userId, requestIdRef.current);
          }

          options.onCancel?.();
          return;
        }

        // Handle error
        const error = err instanceof Error ? err : new Error('Streaming failed');
        setStatus('error');
        setError(error);

        // Complete analytics with error
        if (sessionIdRef.current) {
          completeStreamingSession(sessionIdRef.current, 'error', error.message);
        }

        // Mark queue request complete
        if (requestIdRef.current && options.userId) {
          markRequestComplete(options.userId, requestIdRef.current);
        }

        options.onError?.(error);
      } finally {
        isStreamingRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [streamAction, options, estimatedTotal]
  );

  /**
   * Cancel the current stream
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current && isStreamingRef.current) {
      abortControllerRef.current.abort();
      setStatus('cancelled');
      isStreamingRef.current = false;
      options.onCancel?.();
    }
  }, [options]);

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setContent('');
    setReasoning('');
    setTokenCount(0);
    setError(null);
    setProgress(0);
    setQueuePosition(undefined);
    setQueueMessage(undefined);
    isStreamingRef.current = false;
    abortControllerRef.current = null;
    sessionIdRef.current = null;
    requestIdRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Cleanup queue if needed
      if (requestIdRef.current && options.userId) {
        markRequestComplete(options.userId, requestIdRef.current);
      }
    };
  }, [options.userId]);

  return {
    // State
    status,
    content,
    reasoning,
    tokenCount,
    error,
    progress,
    estimatedTotal,
    queuePosition,
    queueMessage,
    isStreaming: status === 'streaming' || status === 'connecting' || status === 'queued',
    isComplete: status === 'complete',
    isError: status === 'error',
    isCancelled: status === 'cancelled',
    isQueued: status === 'queued',

    // Actions
    start,
    cancel,
    reset,
  };
}
