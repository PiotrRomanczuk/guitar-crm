import { UserList, UserForm, UserCard } from '@/components/admin';

describe('Admin Components', () => {
	it('should export admin components correctly', () => {
		expect(UserList).toBeDefined();
		expect(UserForm).toBeDefined();
		expect(UserCard).toBeDefined();
	});
});
