import { enrollMFA, verifyMFAEnrollment, challengeMFA, verifyMFA, unenrollMFA, listMFAFactors } from '../mfa';

const mockGetUser = jest.fn();
const mockEnroll = jest.fn();
const mockChallenge = jest.fn();
const mockVerify = jest.fn();
const mockUnenroll = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(() => ({
		auth: {
			getUser: mockGetUser,
			mfa: {
				enroll: mockEnroll,
				challenge: mockChallenge,
				verify: mockVerify,
				unenroll: mockUnenroll,
			},
		},
	})),
}));

beforeEach(() => {
	jest.clearAllMocks();
	mockGetUser.mockResolvedValue({
		data: { user: { id: 'user-123', factors: [] } },
		error: null,
	});
});

describe('enrollMFA', () => {
	it('should return error when not authenticated', async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
		const result = await enrollMFA();
		expect(result.error).toBe('Unauthorized');
	});

	it('should enroll successfully', async () => {
		mockEnroll.mockResolvedValue({
			data: {
				id: 'factor-1',
				totp: { qr_code: 'data:image/svg+xml;...', secret: 'ABCD1234', uri: 'otpauth://...' },
			},
			error: null,
		});

		const result = await enrollMFA();
		expect(result.success).toBe(true);
		expect(result.factorId).toBe('factor-1');
		expect(result.qrCode).toBe('data:image/svg+xml;...');
		expect(result.secret).toBe('ABCD1234');
	});

	it('should return error on enroll failure', async () => {
		mockEnroll.mockResolvedValue({ data: null, error: { message: 'MFA disabled' } });
		const result = await enrollMFA();
		expect(result.error).toBe('MFA disabled');
	});
});

describe('verifyMFAEnrollment', () => {
	it('should return error when not authenticated', async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
		const result = await verifyMFAEnrollment('factor-1', '123456');
		expect(result.error).toBe('Unauthorized');
	});

	it('should verify enrollment successfully', async () => {
		mockChallenge.mockResolvedValue({ data: { id: 'challenge-1' }, error: null });
		mockVerify.mockResolvedValue({ error: null });

		const result = await verifyMFAEnrollment('factor-1', '123456');
		expect(result.success).toBe(true);
		expect(mockChallenge).toHaveBeenCalledWith({ factorId: 'factor-1' });
		expect(mockVerify).toHaveBeenCalledWith({
			factorId: 'factor-1',
			challengeId: 'challenge-1',
			code: '123456',
		});
	});

	it('should return error on invalid code', async () => {
		mockChallenge.mockResolvedValue({ data: { id: 'challenge-1' }, error: null });
		mockVerify.mockResolvedValue({ error: { message: 'Invalid code' } });

		const result = await verifyMFAEnrollment('factor-1', '000000');
		expect(result.error).toContain('Invalid verification code');
	});
});

describe('challengeMFA', () => {
	it('should create challenge', async () => {
		mockChallenge.mockResolvedValue({ data: { id: 'challenge-2' }, error: null });
		const result = await challengeMFA('factor-1');
		expect(result.success).toBe(true);
		expect(result.challengeId).toBe('challenge-2');
	});

	it('should return error on failure', async () => {
		mockChallenge.mockResolvedValue({ data: null, error: { message: 'Factor not found' } });
		const result = await challengeMFA('bad-factor');
		expect(result.error).toBe('Factor not found');
	});
});

describe('verifyMFA', () => {
	it('should verify successfully', async () => {
		mockVerify.mockResolvedValue({ error: null });
		const result = await verifyMFA('factor-1', 'challenge-1', '123456');
		expect(result.success).toBe(true);
	});

	it('should return error on invalid code', async () => {
		mockVerify.mockResolvedValue({ error: { message: 'Bad code' } });
		const result = await verifyMFA('factor-1', 'challenge-1', '000000');
		expect(result.error).toContain('Invalid verification code');
	});
});

describe('unenrollMFA', () => {
	it('should return error when not authenticated', async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
		const result = await unenrollMFA('factor-1');
		expect(result.error).toBe('Unauthorized');
	});

	it('should unenroll successfully', async () => {
		mockUnenroll.mockResolvedValue({ error: null });
		const result = await unenrollMFA('factor-1');
		expect(result.success).toBe(true);
	});

	it('should return error on failure', async () => {
		mockUnenroll.mockResolvedValue({ error: { message: 'Cannot unenroll' } });
		const result = await unenrollMFA('factor-1');
		expect(result.error).toBe('Cannot unenroll');
	});
});

describe('listMFAFactors', () => {
	it('should return error when not authenticated', async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
		const result = await listMFAFactors();
		expect(result.error).toBe('Unauthorized');
	});

	it('should return empty factors', async () => {
		const result = await listMFAFactors();
		expect(result.success).toBe(true);
		expect(result.factors).toEqual([]);
		expect(result.hasMFA).toBe(false);
	});

	it('should return only verified factors', async () => {
		mockGetUser.mockResolvedValue({
			data: {
				user: {
					id: 'user-123',
					factors: [
						{ id: 'f1', status: 'verified', friendly_name: 'My App', factor_type: 'totp', created_at: '2025-01-01' },
						{ id: 'f2', status: 'unverified', friendly_name: null, factor_type: 'totp', created_at: '2025-01-02' },
					],
				},
			},
			error: null,
		});

		const result = await listMFAFactors();
		expect(result.success).toBe(true);
		expect(result.factors).toHaveLength(1);
		expect(result.factors![0].id).toBe('f1');
		expect(result.hasMFA).toBe(true);
	});
});
