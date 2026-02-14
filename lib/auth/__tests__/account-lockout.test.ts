import {
	checkAccountLockout,
	incrementFailedAttempts,
	resetFailedAttempts,
	MAX_FAILED_ATTEMPTS,
	LOCKOUT_DURATION_MS,
} from '../account-lockout';

const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabase/admin', () => ({
	createAdminClient: () => ({
		from: jest.fn(() => ({
			select: mockSelect,
			update: mockUpdate,
		})),
	}),
}));

// Build fluent chain mocks
function setupSelectChain(data: Record<string, unknown> | null, error: unknown = null) {
	mockSingle.mockReturnValue(Promise.resolve({ data, error }));
	mockEq.mockReturnValue({ single: mockSingle });
	mockSelect.mockReturnValue({ eq: mockEq });
}

function setupUpdateChain() {
	const updateEq = jest.fn().mockResolvedValue({ error: null });
	mockUpdate.mockReturnValue({ eq: updateEq });
	return updateEq;
}

describe('account-lockout', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('constants', () => {
		it('should have MAX_FAILED_ATTEMPTS = 5', () => {
			expect(MAX_FAILED_ATTEMPTS).toBe(5);
		});

		it('should have LOCKOUT_DURATION_MS = 30 minutes', () => {
			expect(LOCKOUT_DURATION_MS).toBe(30 * 60 * 1000);
		});
	});

	describe('checkAccountLockout', () => {
		it('should return not locked when no profile found', async () => {
			setupSelectChain(null, { message: 'not found' });

			const result = await checkAccountLockout('test@example.com');
			expect(result.locked).toBe(false);
		});

		it('should return not locked when locked_until is null', async () => {
			setupSelectChain({ locked_until: null });

			const result = await checkAccountLockout('test@example.com');
			expect(result.locked).toBe(false);
		});

		it('should return locked when locked_until is in the future', async () => {
			const futureTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
			setupSelectChain({ locked_until: futureTime });

			const result = await checkAccountLockout('test@example.com');
			expect(result.locked).toBe(true);
			expect(result.retryAfterMs).toBeGreaterThan(0);
		});

		it('should reset attempts when lock has expired', async () => {
			const pastTime = new Date(Date.now() - 1000).toISOString();
			setupSelectChain({ locked_until: pastTime });
			setupUpdateChain();

			const result = await checkAccountLockout('test@example.com');
			expect(result.locked).toBe(false);
		});
	});

	describe('incrementFailedAttempts', () => {
		it('should not throw when profile not found', async () => {
			setupSelectChain(null, { message: 'not found' });

			await expect(incrementFailedAttempts('test@example.com')).resolves.not.toThrow();
		});

		it('should increment the count', async () => {
			setupSelectChain({ failed_login_attempts: 2 });
			const updateEq = setupUpdateChain();

			await incrementFailedAttempts('test@example.com');

			expect(mockUpdate).toHaveBeenCalledWith(
				expect.objectContaining({ failed_login_attempts: 3 })
			);
			expect(updateEq).toHaveBeenCalled();
		});

		it('should set locked_until when reaching max attempts', async () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			setupSelectChain({ failed_login_attempts: MAX_FAILED_ATTEMPTS - 1 });
			setupUpdateChain();

			await incrementFailedAttempts('test@example.com');

			expect(mockUpdate).toHaveBeenCalledWith(
				expect.objectContaining({
					failed_login_attempts: MAX_FAILED_ATTEMPTS,
					locked_until: expect.any(String),
				})
			);
			consoleSpy.mockRestore();
		});
	});

	describe('resetFailedAttempts', () => {
		it('should reset count and lock', async () => {
			const updateEq = setupUpdateChain();

			await resetFailedAttempts('test@example.com');

			expect(mockUpdate).toHaveBeenCalledWith({
				failed_login_attempts: 0,
				locked_until: null,
			});
			expect(updateEq).toHaveBeenCalled();
		});
	});
});
