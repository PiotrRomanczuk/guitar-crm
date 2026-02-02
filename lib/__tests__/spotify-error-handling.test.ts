import {
  searchTracks,
  getTrack,
  getAudioFeatures,
  isRateLimitError,
  getRetryAfter,
  resetCircuitBreaker,
  clearTokenCache,
} from '../spotify';

// Mock fetch globally
global.fetch = jest.fn();

describe('Spotify Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCircuitBreaker();
    clearTokenCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Request Timeout Handling', () => {
    it('should timeout after 30 seconds', async () => {
      // Mock token request success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      });

      // Mock search request that never resolves
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true }), 40000); // 40s timeout
          })
      );

      const searchPromise = searchTracks('test query');

      // Fast-forward time by 30s
      jest.advanceTimersByTime(30000);

      await expect(searchPromise).rejects.toThrow('Request timeout after 30000ms');
    });
  });

  describe('Rate Limiting (429) Handling', () => {
    it('should handle 429 with Retry-After header', async () => {
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
        headers: new Map([['Retry-After', '5']]),
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

      // Fast-forward past retry delay (5 seconds)
      jest.advanceTimersByTime(5000);

      const result = await promise;

      expect(result).toBeDefined();
      expect(result.tracks.items).toHaveLength(1);
    });

    it('should throw after max retries on repeated 429', async () => {
      // Mock token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      });

      // Mock multiple 429 responses
      for (let i = 0; i < 4; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Map([['Retry-After', '1']]),
          text: async () => JSON.stringify({ error: { message: 'Rate limit exceeded' } }),
        } as any);
      }

      const promise = searchTracks('test query');

      // Fast-forward through all retries
      for (let i = 0; i < 4; i++) {
        jest.advanceTimersByTime(1000);
      }

      await expect(promise).rejects.toThrow('Rate limit exceeded');

      const error = await promise.catch((e) => e);
      expect(isRateLimitError(error)).toBe(true);
      expect(getRetryAfter(error)).toBe(1);
    });

    it('should use default Retry-After when header is missing', async () => {
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
        headers: new Map(),
        text: async () => '{}',
      } as any);

      // Success on retry
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      const promise = searchTracks('test query');

      // Default retry after is 60 seconds
      jest.advanceTimersByTime(60000);

      const result = await promise;
      expect(result).toBeDefined();
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

      // First retry: 1s
      jest.advanceTimersByTime(1000);
      // Second retry: 2s
      jest.advanceTimersByTime(2000);
      // Third retry: 4s
      jest.advanceTimersByTime(4000);

      const result = await promise;
      expect(result).toBeDefined();
    });

    it('should cap backoff at 32 seconds', async () => {
      // Token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // Multiple 500 errors to test max backoff
      for (let i = 0; i < 10; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => 'Unavailable',
        } as any);
      }

      const promise = searchTracks('test query');

      // Backoff: 1s, 2s, 4s (max 3 retries)
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(2000);
      jest.advanceTimersByTime(4000);

      await expect(promise).rejects.toThrow('Service Unavailable');
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after 5 consecutive failures', async () => {
      // Cause 5 failures
      for (let i = 0; i < 5; i++) {
        // Token request
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token', expires_in: 3600 }),
        });

        // Failed request
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Error',
          text: async () => 'Error',
        } as any);

        // Exhaust retries
        for (let j = 0; j < 3; j++) {
          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Error',
            text: async () => 'Error',
          } as any);
        }

        try {
          const promise = searchTracks(`query ${i}`);
          jest.advanceTimersByTime(10000); // Fast-forward through retries
          await promise;
        } catch (e) {
          // Expected
        }

        clearTokenCache(); // Clear cache between requests
      }

      // Token request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      // Next request should fail with circuit breaker
      await expect(searchTracks('query 6')).rejects.toThrow('circuit breaker is open');
    });

    it('should reset circuit breaker after timeout', async () => {
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
          jest.advanceTimersByTime(10000);
          await promise;
        } catch (e) {
          // Expected
        }

        clearTokenCache();
      }

      // Wait for circuit breaker to reset (60s)
      jest.advanceTimersByTime(60000);

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
    });
  });

  describe('getTrack and getAudioFeatures', () => {
    it('should apply same error handling to getTrack', async () => {
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
        headers: new Map([['Retry-After', '1']]),
        text: async () => '{}',
      } as any);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'track123', name: 'Test Track' }),
      });

      const promise = getTrack('track123');
      jest.advanceTimersByTime(1000);

      const result = await promise;
      expect(result.id).toBe('track123');
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

    it('should refresh token when expired', async () => {
      // First token with short expiry
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'old-token', expires_in: 1 }), // 1 second
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } }),
      });

      await searchTracks('query 1');

      // Advance past token expiration (1s + 60s buffer = already expired)
      jest.advanceTimersByTime(2000);

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
    });
  });

  describe('Error Helper Functions', () => {
    it('isRateLimitError should identify rate limit errors correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token', expires_in: 3600 }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map([['Retry-After', '10']]),
        text: async () => '{}',
      } as any);

      for (let i = 0; i < 4; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Map([['Retry-After', '10']]),
          text: async () => '{}',
        } as any);
      }

      const promise = searchTracks('test');
      jest.advanceTimersByTime(50000);

      const error = await promise.catch((e) => e);
      expect(isRateLimitError(error)).toBe(true);
      expect(getRetryAfter(error)).toBe(10);
    });

    it('isRateLimitError should return false for other errors', async () => {
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
      jest.advanceTimersByTime(10000);

      const error = await promise.catch((e) => e);
      expect(isRateLimitError(error)).toBe(false);
      expect(getRetryAfter(error)).toBeUndefined();
    });
  });
});
