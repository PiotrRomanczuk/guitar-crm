import { UserList, UserForm, UserCard } from '@/components/dashboard/admin';

describe('Admin Components', () => {
	it('should export admin components correctly', () => {
		expect(UserList).toBeDefined();
		expect(UserForm).toBeDefined();
		expect(UserCard).toBeDefined();
	});
});
