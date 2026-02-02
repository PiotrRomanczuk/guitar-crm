import {
  searchTracks,
  getTrack,
  getAudioFeatures,
  isRateLimitError,
  getRetryAfter,
  resetCircuitBreaker,
  clearTokenCache,
} from '../spotify';

// Mock environment variables
const originalEnv = process.env;

// Mock fetch globally
global.fetch = jest.fn();

describe('Spotify Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCircuitBreaker();
    clearTokenCache();

    // Mock Spotify credentials
    process.env = {
      ...originalEnv,
      SPOTIFY_CLIENT_ID: 'test-client-id',
      SPOTIFY_CLIENT_SECRET: 'test-client-secret',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Rate Limiting (429) Handling', () => {
    it('should handle 429 with Retry-After header and retry', async () => {
      jest.useFakeTimers();

      // Mock token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      });

      // First request: 429 rate limit
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          get: (name: string) => (name === 'Retry-After' ? '1' : null),
        },
        text: async () => JSON.stringify({ error: { message: 'Rate limit exceeded' } }),
      } as any);

      // Second request: success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tracks: {
            items: [{ id: '1', name: 'Test Track', artists: [{ name: 'Test Artist' }] }],
          },
        }),
      });

      const promise = searchTracks('test query');

      // Run all pending timers
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBeDefined();
      expect(result.tracks.items).toHaveLength(1);

      jest.useRealTimers();
    });

    it('should throw after max retries on repeated 429', async () => {
      jest.useFakeTimers();

      // Mock token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      });

      // Mock 4 consecutive 429 responses
      for (let i = 0; i < 4; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            get: (name: string) => (name === 'Retry-After' ? '1' : null),
          },
          text: async () => JSON.stringify({ error: { message: 'Rate limit exceeded' } }),
        } as any);
      }

      const promise = searchTracks('test query');

      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Rate limit exceeded');

      const error = await promise.catch((e) => e);
      expect(isRateLimitError(error)).toBe(true);
      expect(getRetryAfter(error)).toBe(1);

      jest.useRealTimers();
    });

    it('should use default Retry-After when header is missing', async () => {
      jest.useFakeTimers();

      // Mock token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      });

      // Mock 429 without Retry-After header
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          get: () => null,
        },
        text: async () => '{}',
      } as any);

      // Success on retry
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      const promise = searchTracks('test query');

      await jest.runAllTimersAsync();

      const result = await promise;
      expect(result).toBeDefined();

      jest.useRealTimers();
    });
  });

  describe('Token Expiration (401) Handling', () => {
    it('should retry with fresh token on 401', async () => {
      // First token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'old-token', expires_in: 3600 }),
      });

      // Search with old token returns 401
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => JSON.stringify({ error: { message: 'Invalid token' } }),
      } as any);

      // Second token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });

      // Retry with new token succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      const result = await searchTracks('test query');

      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(4); // token + 401 + new token + success
    });

    it('should fail after one retry on persistent 401', async () => {
      // First token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // Both requests return 401
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '{}',
      } as any);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '{}',
      } as any);

      await expect(searchTracks('test query')).rejects.toThrow('Unauthorized');
    });
  });

  describe('Server Error (5xx) Retry with Exponential Backoff', () => {
    it('should retry 5xx errors with exponential backoff', async () => {
      jest.useFakeTimers();

      // Token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // Three 500 errors, then success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      } as any);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      } as any);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      } as any);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      const promise = searchTracks('test query');

      await jest.runAllTimersAsync();

      const result = await promise;
      expect(result).toBeDefined();

      jest.useRealTimers();
    });

    it('should fail after max retries on persistent 5xx errors', async () => {
      jest.useFakeTimers();

      // Token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // 4 consecutive 503 errors
      for (let i = 0; i < 4; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => 'Unavailable',
        } as any);
      }

      const promise = searchTracks('test query');

      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Service Unavailable');

      jest.useRealTimers();
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after 5 consecutive failures', async () => {
      jest.useFakeTimers();

      // Cause 5 failures
      for (let i = 0; i < 5; i++) {
        // Token request
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token', expires_in: 3600 }),
        });

        // 4 failed requests (1 initial + 3 retries)
        for (let j = 0; j < 4; j++) {
          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Error',
            text: async () => 'Error',
          } as any);
        }

        try {
          const promise = searchTracks(`query ${i}`);
          await jest.runAllTimersAsync();
          await promise;
        } catch (e) {
          // Expected
        }

        clearTokenCache();
      }

      // Next request should fail with circuit breaker
      await expect(searchTracks('query 6')).rejects.toThrow('circuit breaker is open');

      jest.useRealTimers();
    });

    it('should reset circuit breaker after timeout', async () => {
      jest.useFakeTimers();

      // Trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token', expires_in: 3600 }),
        });

        for (let j = 0; j < 4; j++) {
          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Error',
            text: async () => 'Error',
          } as any);
        }

        try {
          const promise = searchTracks(`query ${i}`);
          await jest.runAllTimersAsync();
          await promise;
        } catch (e) {
          // Expected
        }

        clearTokenCache();
      }

      // Manually reset for testing
      resetCircuitBreaker();

      // Token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // Should succeed now
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      const result = await searchTracks('query after reset');
      expect(result).toBeDefined();

      jest.useRealTimers();
    });
  });

  describe('getTrack and getAudioFeatures', () => {
    it('should apply same error handling to getTrack', async () => {
      jest.useFakeTimers();

      // Token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // 429 then success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          get: (name: string) => (name === 'Retry-After' ? '1' : null),
        },
        text: async () => '{}',
      } as any);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'track123', name: 'Test Track' }),
      });

      const promise = getTrack('track123');
      await jest.runAllTimersAsync();

      const result = await promise;
      expect(result.id).toBe('track123');

      jest.useRealTimers();
    });

    it('should apply same error handling to getAudioFeatures', async () => {
      // Token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // 401 then new token then success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '{}',
      } as any);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tempo: 120, key: 0, mode: 1 }),
      });

      const result = await getAudioFeatures('track123');
      expect(result.tempo).toBe(120);
    });
  });

  describe('Token Caching', () => {
    it('should use cached token for subsequent requests', async () => {
      // First token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'cached-token', expires_in: 3600 }),
      });

      // First search request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      await searchTracks('query 1');

      // Second search should use cached token (no token request)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      await searchTracks('query 2');

      // Should only have 3 fetch calls: 1 token + 2 searches
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should refresh token when cache expires', async () => {
      jest.useFakeTimers();

      // First token with very short expiry
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'old-token', expires_in: 1 }), // 1 second
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      await searchTracks('query 1');

      // Advance time past expiration
      jest.advanceTimersByTime(2000); // 2 seconds (1s expiry - 60s buffer = already expired)

      // Second token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      await searchTracks('query 2');

      // Should have 4 calls: old token + search + new token + search
      expect(global.fetch).toHaveBeenCalledTimes(4);

      jest.useRealTimers();
    });
  });

  describe('Error Helper Functions', () => {
    it('isRateLimitError should identify rate limit errors correctly', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      for (let i = 0; i < 4; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            get: (name: string) => (name === 'Retry-After' ? '10' : null),
          },
          text: async () => '{}',
        } as any);
      }

      const promise = searchTracks('test');
      await jest.runAllTimersAsync();

      const error = await promise.catch((e) => e);
      expect(isRateLimitError(error)).toBe(true);
      expect(getRetryAfter(error)).toBe(10);

      jest.useRealTimers();
    });

    it('isRateLimitError should return false for other errors', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      for (let i = 0; i < 4; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          text: async () => 'Error',
        } as any);
      }

      const promise = searchTracks('test');
      await jest.runAllTimersAsync();

      const error = await promise.catch((e) => e);
      expect(isRateLimitError(error)).toBe(false);
      expect(getRetryAfter(error)).toBeUndefined();

      jest.useRealTimers();
    });
  });
});
