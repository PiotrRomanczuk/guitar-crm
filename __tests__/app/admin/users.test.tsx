import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Supabase client first
const mockSupabase = {
	from: jest.fn(() => ({
		select: jest.fn().mockReturnThis(),
		eq: jest.fn().mockReturnThis(),
		order: jest.fn().mockReturnThis(),
		range: jest.fn().mockReturnThis(),
		insert: jest.fn().mockReturnThis(),
		update: jest.fn().mockReturnThis(),
		delete: jest.fn().mockReturnThis(),
		or: jest.fn().mockReturnThis(),
	})),
};

jest.mock('@/lib/supabase', () => ({
	supabase: mockSupabase,
}));

// Now import components that use supabase
import UsersPage from '../../../app/admin/users/page';
import { AuthProvider } from '@/components/auth';

// Mock auth context with admin user
const mockAuthContext = {
	user: { id: '1', email: 'admin@test.com' },
	session: { user: { id: '1' } },
	loading: false,
	signOut: jest.fn(),
	isAdmin: true,
	isTeacher: false,
	isStudent: false,
};

jest.mock('@/components/auth', () => ({
	...jest.requireActual('@/components/auth'),
	useAuth: () => mockAuthContext,
}));

describe('Admin User Management', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('UserList Page', () => {
		it('should render user list page with admin protection', async () => {
			// Mock successful API response
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnValue({
					order: jest.fn().mockReturnValue({
						range: jest.fn().mockResolvedValue({
							data: [
								{
									id: 1,
									email: 'user1@test.com',
									firstName: 'John',
									lastName: 'Doe',
									isAdmin: false,
									isTeacher: true,
									isStudent: false,
									isActive: true,
									created_at: '2025-01-01T00:00:00Z',
								},
								{
									id: 2,
									email: 'user2@test.com',
									firstName: 'Jane',
									lastName: 'Smith',
									isAdmin: false,
									isTeacher: false,
									isStudent: true,
									isActive: true,
									created_at: '2025-01-02T00:00:00Z',
								},
							],
							error: null,
						}),
					}),
				}),
			});

			render(
				<AuthProvider>
					<UserList />
				</AuthProvider>
			);

			// Should show loading initially
			expect(screen.getByText(/loading/i)).toBeInTheDocument();

			// Wait for users to load
			await waitFor(() => {
				expect(screen.getByText('John Doe')).toBeInTheDocument();
				expect(screen.getByText('Jane Smith')).toBeInTheDocument();
			});

			// Should show user roles
			expect(screen.getByText('Teacher')).toBeInTheDocument();
			expect(screen.getByText('Student')).toBeInTheDocument();
		});

		it('should show create user button for admins', async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnValue({
					order: jest.fn().mockReturnValue({
						range: jest.fn().mockResolvedValue({
							data: [],
							error: null,
						}),
					}),
				}),
			});

			render(
				<AuthProvider>
					<UserList />
				</AuthProvider>
			);

			await waitFor(() => {
				expect(screen.getByText(/create user/i)).toBeInTheDocument();
			});
		});

		it('should allow searching users', async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnValue({
					order: jest.fn().mockReturnValue({
						range: jest.fn().mockResolvedValue({
							data: [
								{
									id: 1,
									email: 'john@test.com',
									firstName: 'John',
									lastName: 'Doe',
									isAdmin: false,
									isTeacher: true,
									isStudent: false,
									isActive: true,
									created_at: '2025-01-01T00:00:00Z',
								},
							],
							error: null,
						}),
					}),
				}),
			});

			render(
				<AuthProvider>
					<UserList />
				</AuthProvider>
			);

			// Find search input
			const searchInput = await screen.findByPlaceholderText(/search users/i);

			// Search for a user
			fireEvent.change(searchInput, { target: { value: 'john' } });

			// Should trigger search
			await waitFor(() => {
				expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
			});
		});

		it('should show error message when loading fails', async () => {
			mockSupabase.from.mockReturnValue({
				select: jest.fn().mockReturnValue({
					order: jest.fn().mockReturnValue({
						range: jest.fn().mockResolvedValue({
							data: null,
							error: { message: 'Database error' },
						}),
					}),
				}),
			});

			render(
				<AuthProvider>
					<UserList />
				</AuthProvider>
			);

			await waitFor(() => {
				expect(screen.getByText(/error loading users/i)).toBeInTheDocument();
				expect(screen.getByText('Database error')).toBeInTheDocument();
			});
		});
	});
});
