// Simple test to verify Jest setup
describe('Jest Setup', () => {
	it('should run basic tests', () => {
		expect(1 + 1).toBe(2);
	});

	it('should handle async operations', async () => {
		const asyncOperation = () => Promise.resolve('success');
		const result = await asyncOperation();
		expect(result).toBe('success');
	});

	it('should have access to global test utilities', () => {
		// @ts-expect-error - global test utilities
		const mockUser = global.testUtils.createMockUser();
		expect(mockUser.email).toBe('test@example.com');
		expect(mockUser.isStudent).toBe(true);
	});
});
