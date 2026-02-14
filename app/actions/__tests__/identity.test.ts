import { listIdentities, unlinkIdentity } from '../identity';

const mockGetUser = jest.fn();
const mockUnlinkIdentity = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(() => ({
		auth: {
			getUser: mockGetUser,
			unlinkIdentity: mockUnlinkIdentity,
		},
	})),
}));

beforeEach(() => {
	jest.clearAllMocks();
});

describe('listIdentities', () => {
	it('should return error when not authenticated', async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
		const result = await listIdentities();
		expect(result.error).toBe('Unauthorized');
	});

	it('should return user identities', async () => {
		mockGetUser.mockResolvedValue({
			data: {
				user: {
					id: 'user-123',
					identities: [
						{ id: 'id-1', provider: 'email', created_at: '2025-01-01', last_sign_in_at: '2025-01-15' },
						{ id: 'id-2', provider: 'google', created_at: '2025-01-05', last_sign_in_at: '2025-01-10' },
					],
				},
			},
			error: null,
		});

		const result = await listIdentities();
		expect(result.success).toBe(true);
		expect(result.identities).toHaveLength(2);
		expect(result.identities![0].provider).toBe('email');
		expect(result.identities![1].provider).toBe('google');
	});

	it('should handle user with no identities', async () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'user-123', identities: [] } },
			error: null,
		});

		const result = await listIdentities();
		expect(result.success).toBe(true);
		expect(result.identities).toEqual([]);
	});
});

describe('unlinkIdentity', () => {
	it('should return error when not authenticated', async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
		const result = await unlinkIdentity('id-1');
		expect(result.error).toBe('Unauthorized');
	});

	it('should prevent unlinking the only identity', async () => {
		mockGetUser.mockResolvedValue({
			data: {
				user: {
					id: 'user-123',
					identities: [{ id: 'id-1', provider: 'email', created_at: '2025-01-01', last_sign_in_at: null }],
				},
			},
			error: null,
		});

		const result = await unlinkIdentity('id-1');
		expect(result.error).toContain('Cannot remove your only sign-in method');
		expect(mockUnlinkIdentity).not.toHaveBeenCalled();
	});

	it('should return error for non-existent identity', async () => {
		mockGetUser.mockResolvedValue({
			data: {
				user: {
					id: 'user-123',
					identities: [
						{ id: 'id-1', provider: 'email', created_at: '2025-01-01', last_sign_in_at: null },
						{ id: 'id-2', provider: 'google', created_at: '2025-01-05', last_sign_in_at: null },
					],
				},
			},
			error: null,
		});

		const result = await unlinkIdentity('id-nonexistent');
		expect(result.error).toBe('Identity not found.');
	});

	it('should unlink identity successfully', async () => {
		const googleIdentity = { id: 'id-2', provider: 'google', created_at: '2025-01-05', last_sign_in_at: null };
		mockGetUser.mockResolvedValue({
			data: {
				user: {
					id: 'user-123',
					identities: [
						{ id: 'id-1', provider: 'email', created_at: '2025-01-01', last_sign_in_at: null },
						googleIdentity,
					],
				},
			},
			error: null,
		});
		mockUnlinkIdentity.mockResolvedValue({ error: null });

		const result = await unlinkIdentity('id-2');
		expect(result.success).toBe(true);
		expect(mockUnlinkIdentity).toHaveBeenCalledWith(googleIdentity);
	});

	it('should return error on unlink failure', async () => {
		mockGetUser.mockResolvedValue({
			data: {
				user: {
					id: 'user-123',
					identities: [
						{ id: 'id-1', provider: 'email', created_at: '2025-01-01', last_sign_in_at: null },
						{ id: 'id-2', provider: 'google', created_at: '2025-01-05', last_sign_in_at: null },
					],
				},
			},
			error: null,
		});
		mockUnlinkIdentity.mockResolvedValue({ error: { message: 'Unlink failed' } });

		const result = await unlinkIdentity('id-2');
		expect(result.error).toBe('Unlink failed');
	});
});
