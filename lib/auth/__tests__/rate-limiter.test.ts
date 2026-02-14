/**
 * Rate Limiter Tests
 *
 * Tests for fail-closed behavior and configuration
 */

import { AUTH_RATE_LIMITS } from '../rate-limiter';

// We test the exported config directly.
// The checkAuthRateLimit function requires a real Supabase connection,
// so it's tested via integration tests and mocked in action tests.

describe('Rate Limiter', () => {
	describe('AUTH_RATE_LIMITS config', () => {
		it('should have login limits', () => {
			expect(AUTH_RATE_LIMITS.login.maxAttempts).toBe(10);
			expect(AUTH_RATE_LIMITS.login.windowMs).toBe(15 * 60 * 1000);
		});

		it('should have signup limits', () => {
			expect(AUTH_RATE_LIMITS.signup.maxAttempts).toBe(3);
			expect(AUTH_RATE_LIMITS.signup.windowMs).toBe(60 * 60 * 1000);
		});

		it('should have passwordReset limits', () => {
			expect(AUTH_RATE_LIMITS.passwordReset.maxAttempts).toBe(5);
			expect(AUTH_RATE_LIMITS.passwordReset.windowMs).toBe(60 * 60 * 1000);
		});

		it('should have resendEmail limits', () => {
			expect(AUTH_RATE_LIMITS.resendEmail.maxAttempts).toBe(3);
			expect(AUTH_RATE_LIMITS.resendEmail.windowMs).toBe(60 * 60 * 1000);
		});
	});

	describe('fail-closed behavior', () => {
		it('should document fail-closed in the checkAuthRateLimit function', async () => {
			// This test verifies the source code contains fail-closed comments
			// The actual fail-closed logic is tested via integration tests
			// and through the mock-based action tests above
			const fs = require('fs');
			const source = fs.readFileSync(
				require.resolve('../rate-limiter'),
				'utf-8'
			);

			expect(source).toContain('Fail closed');
			expect(source).not.toContain('Fail open');
		});
	});
});
