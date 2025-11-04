/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import * as serverClientModule from '@/utils/supabase/clients/server';
import { getUserRoles } from '@/lib/getUserRoles';

// Subject under test is statically imported above

// Mock the server-side Supabase client factory
const mockAuth: { getUser: jest.Mock<() => Promise<any>> } = {
	getUser: jest.fn() as jest.Mock<() => Promise<any>>,
};

function makeFromChain(profileData: any, error: any = null) {
	const chain: any = {};
	chain.select = jest.fn().mockReturnValue(chain);
	chain.eq = jest.fn().mockReturnValue(chain);
	chain.single = (jest.fn() as jest.Mock<() => Promise<any>>).mockResolvedValue(
		{ data: profileData, error }
	);
	return chain;
}

const mockSupabase: any = {
	auth: mockAuth,
	from: jest.fn(),
};

describe('getUserRoles', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest
			.spyOn(serverClientModule, 'createClient')
			.mockResolvedValue(mockSupabase as any);
	});

	it('returns roles for a provided userId', async () => {
		const profile = { isAdmin: true, isTeacher: false, isStudent: true };
		mockSupabase.from.mockImplementation(() => makeFromChain(profile));
		mockAuth.getUser.mockResolvedValue({ data: { user: null } } as any);

		const result = await getUserRoles({ userId: 'user-123' });
		expect(result).toEqual({
			isUserAdmin: true,
			isUserTeacher: false,
			isUserStudent: true,
		});
	});

	it('uses authenticated user when userId not provided', async () => {
		const profile = { isAdmin: false, isTeacher: true, isStudent: false };
		mockSupabase.from.mockImplementation(() => makeFromChain(profile));
		mockAuth.getUser.mockResolvedValue({
			data: { user: { id: 'u-1' } },
		} as any);

		const result = await getUserRoles();
		expect(result).toEqual({
			isUserAdmin: false,
			isUserTeacher: true,
			isUserStudent: false,
		});
	});

	it('returns all false when unauthenticated', async () => {
		mockAuth.getUser.mockResolvedValue({ data: { user: null } } as any);

		const result = await getUserRoles();
		expect(result).toEqual({
			isUserAdmin: false,
			isUserTeacher: false,
			isUserStudent: false,
		});
	});

	it('returns all false when profile not found', async () => {
		mockSupabase.from.mockImplementation(() =>
			makeFromChain(null, { message: 'not found' })
		);
		mockAuth.getUser.mockResolvedValue({
			data: { user: { id: 'u-2' } },
		} as any);

		const result = await getUserRoles();
		expect(result).toEqual({
			isUserAdmin: false,
			isUserTeacher: false,
			isUserStudent: false,
		});
	});
});
