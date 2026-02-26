/**
 * Tests for Atomic Rate Limiter
 */

import { checkAuthRateLimit, AUTH_RATE_LIMITS } from '@/lib/auth/rate-limiter';

// Mock Supabase admin client
const mockRpc = jest.fn();
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: mockRpc,
    from: () => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }),
  }),
}));

describe('checkAuthRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow request when under the limit', async () => {
    mockRpc.mockResolvedValue({ data: 1, error: null });

    const result = await checkAuthRateLimit('user@test.com', 'login');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(AUTH_RATE_LIMITS.login.maxAttempts - 1);
    expect(mockRpc).toHaveBeenCalledWith(
      'check_and_record_auth_rate_limit',
      {
        p_identifier: 'user@test.com',
        p_operation: 'login',
        p_window_ms: AUTH_RATE_LIMITS.login.windowMs,
      }
    );
  });

  it('should allow request at exactly the max limit', async () => {
    mockRpc.mockResolvedValue({
      data: AUTH_RATE_LIMITS.login.maxAttempts,
      error: null,
    });

    const result = await checkAuthRateLimit('user@test.com', 'login');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should block request when over the limit', async () => {
    mockRpc.mockResolvedValue({
      data: AUTH_RATE_LIMITS.login.maxAttempts + 1,
      error: null,
    });

    const result = await checkAuthRateLimit('user@test.com', 'login');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeDefined();
  });

  it('should fail closed on database error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'DB connection failed' },
    });

    const result = await checkAuthRateLimit('user@test.com', 'login');

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBe(60);
  });

  it('should use correct config for different operations', async () => {
    mockRpc.mockResolvedValue({ data: 1, error: null });

    await checkAuthRateLimit('user@test.com', 'passwordReset');

    expect(mockRpc).toHaveBeenCalledWith(
      'check_and_record_auth_rate_limit',
      expect.objectContaining({
        p_operation: 'passwordReset',
        p_window_ms: AUTH_RATE_LIMITS.passwordReset.windowMs,
      })
    );
  });
});
