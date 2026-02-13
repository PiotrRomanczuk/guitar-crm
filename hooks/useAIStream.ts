'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Streaming status states
 */
export type AIStreamStatus = 'idle' | 'connecting' | 'streaming' | 'complete' | 'error' | 'cancelled';

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

  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

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
      isStreamingRef.current = true;

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // Merge params with options
        const mergedParams = { ...options.params, ...params } as T;

        // Start streaming
        const stream = streamAction(mergedParams, abortControllerRef.current.signal);
        setStatus('streaming');

        let finalContent = '';

        for await (const chunk of stream) {
          // Check if cancelled
          if (abortControllerRef.current?.signal.aborted) {
            setStatus('cancelled');
            options.onCancel?.();
            return;
          }

          // Update content
          finalContent = chunk;
          setContent(chunk);

          // Estimate token count (rough approximation: 1 token ≈ 4 characters)
          setTokenCount(Math.ceil(chunk.length / 4));

          // Trigger chunk callback
          options.onChunk?.(chunk);
        }

        // Streaming complete
        setStatus('complete');
        options.onComplete?.(finalContent);
      } catch (err) {
        // Check if error is due to cancellation
        if (abortControllerRef.current?.signal.aborted) {
          setStatus('cancelled');
          options.onCancel?.();
          return;
        }

        // Handle error
        const error = err instanceof Error ? err : new Error('Streaming failed');
        setStatus('error');
        setError(error);
        options.onError?.(error);
      } finally {
        isStreamingRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [streamAction, options]
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
    isStreamingRef.current = false;
    abortControllerRef.current = null;
  }, []);

  return {
    // State
    status,
    content,
    reasoning,
    tokenCount,
    error,
    isStreaming: status === 'streaming' || status === 'connecting',
    isComplete: status === 'complete',
    isError: status === 'error',
    isCancelled: status === 'cancelled',

    // Actions
    start,
    cancel,
    reset,
  };
}
