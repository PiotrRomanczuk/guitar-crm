import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList } from '../../../components/admin/UserList';
import { UserForm } from '../../../components/admin/UserForm';
import { UserCard } from '../../../components/admin/UserCard';

// Mock the Supabase client
const mockSupabase = {
	from: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	update: jest.fn().mockReturnThis(),
	delete: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	order: jest.fn().mockReturnThis(),
	range: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase', () => ({
	supabase: mockSupabase,
}));

describe('Admin User Components', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('UserCard', () => {
		const mockUser = {
			id: 1,
			email: 'john@test.com',
			firstName: 'John',
			lastName: 'Doe',
			isAdmin: false,
			isTeacher: true,
			isStudent: false,
			isActive: true,
			created_at: '2025-01-01T00:00:00Z',
		};

		it('should render user information correctly', () => {
			render(
				<UserCard user={mockUser} onEdit={jest.fn()} onDelete={jest.fn()} />
			);

			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('john@test.com')).toBeInTheDocument();
			expect(screen.getByText('Teacher')).toBeInTheDocument();
			expect(screen.getByText('✓ Active')).toBeInTheDocument();
		});

		it('should show admin badge for admin users', () => {
			const adminUser = { ...mockUser, isAdmin: true };

			render(
				<UserCard user={adminUser} onEdit={jest.fn()} onDelete={jest.fn()} />
			);

			expect(screen.getByText('Admin')).toBeInTheDocument();
		});

		it('should call onEdit when edit button is clicked', () => {
			const onEdit = jest.fn();

			render(<UserCard user={mockUser} onEdit={onEdit} onDelete={jest.fn()} />);

			fireEvent.click(screen.getByText(/edit/i));
			expect(onEdit).toHaveBeenCalled();
		});

		it('should call onDelete when delete button is clicked', () => {
			const onDelete = jest.fn();

			render(
				<UserCard user={mockUser} onEdit={jest.fn()} onDelete={onDelete} />
			);

			fireEvent.click(screen.getByText(/deactivate/i));
			expect(onDelete).toHaveBeenCalled();
		});

		it('should show inactive status for inactive users', () => {
			const inactiveUser = { ...mockUser, isActive: false };

			render(
				<UserCard user={inactiveUser} onEdit={jest.fn()} onDelete={jest.fn()} />
			);

			expect(screen.getByText('✗ Inactive')).toBeInTheDocument();
		});
	});

	describe('UserForm', () => {
		it('should render create user form correctly', () => {
			render(
				<UserForm mode='create' onSubmit={jest.fn()} onCancel={jest.fn()} />
			);

			expect(screen.getByText(/create user/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(
				screen.getByRole('checkbox', { name: /admin/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('checkbox', { name: /teacher/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('checkbox', { name: /student/i })
			).toBeInTheDocument();
		});

		it('should render edit user form with existing data', () => {
			const existingUser = {
				id: 1,
				email: 'john@test.com',
				firstName: 'John',
				lastName: 'Doe',
				isAdmin: false,
				isTeacher: true,
				isStudent: false,
				isActive: true,
			};

			render(
				<UserForm
					mode='edit'
					user={existingUser}
					onSubmit={jest.fn()}
					onCancel={jest.fn()}
				/>
			);

			expect(screen.getByText(/edit user/i)).toBeInTheDocument();
			expect(screen.getByDisplayValue('John')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
			expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
		});

		it('should validate required fields', async () => {
			const user = userEvent.setup();
			const onSubmit = jest.fn();

			render(
				<UserForm mode='create' onSubmit={onSubmit} onCancel={jest.fn()} />
			);

			// Try to submit without filling required fields
			await user.click(screen.getByText(/create user/i));

			// Should show validation errors
			expect(screen.getByText(/first name is required/i)).toBeTruthy();
			expect(screen.getByText(/last name is required/i)).toBeTruthy();
			expect(screen.getByText(/valid email is required/i)).toBeTruthy();

			// Should not call onSubmit
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it('should submit form with valid data', async () => {
			const user = userEvent.setup();
			const onSubmit = jest.fn();

			render(
				<UserForm mode='create' onSubmit={onSubmit} onCancel={jest.fn()} />
			);

			// Fill in the form
			await user.type(screen.getByLabelText(/first name/i), 'John');
			await user.type(screen.getByLabelText(/last name/i), 'Doe');
			await user.type(screen.getByLabelText(/email/i), 'john@test.com');
			await user.click(screen.getByLabelText(/teacher/i));

			// Submit the form
			await user.click(screen.getByText(/create user/i));

			// Should call onSubmit with correct data
			expect(onSubmit).toHaveBeenCalledWith({
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@test.com',
				isAdmin: false,
				isTeacher: true,
				isStudent: false,
				isActive: true,
			});
		});

		it('should call onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const onCancel = jest.fn();

			render(
				<UserForm mode='create' onSubmit={jest.fn()} onCancel={onCancel} />
			);

			await user.click(screen.getByText(/cancel/i));
			expect(onCancel).toHaveBeenCalled();
		});
	});

	describe('UserList', () => {
		const mockUsers = [
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
			{
				id: 2,
				email: 'jane@test.com',
				firstName: 'Jane',
				lastName: 'Smith',
				isAdmin: true,
				isTeacher: false,
				isStudent: false,
				isActive: true,
				created_at: '2025-01-02T00:00:00Z',
			},
		];

		it('should render list of users', () => {
			render(
				<UserList
					users={mockUsers}
					loading={false}
					onEdit={jest.fn()}
					onDelete={jest.fn()}
					onSearch={jest.fn()}
				/>
			);

			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		});

		it('should show loading state', () => {
			render(
				<UserList
					users={[]}
					loading={true}
					onEdit={jest.fn()}
					onDelete={jest.fn()}
					onSearch={jest.fn()}
				/>
			);

			expect(screen.getByText(/loading/i)).toBeInTheDocument();
		});

		it('should show empty state when no users', () => {
			render(
				<UserList
					users={[]}
					loading={false}
					onEdit={jest.fn()}
					onDelete={jest.fn()}
					onSearch={jest.fn()}
				/>
			);

			expect(screen.getByText(/no users found/i)).toBeInTheDocument();
		});

		it('should handle search input', async () => {
			const user = userEvent.setup();
			const onSearch = jest.fn();

			render(
				<UserList
					users={mockUsers}
					loading={false}
					onEdit={jest.fn()}
					onDelete={jest.fn()}
					onSearch={onSearch}
				/>
			);

			const searchInput = screen.getByPlaceholderText(/search users/i);
			await user.type(searchInput, 'john');

			expect(onSearch).toHaveBeenCalledWith('john');
		});
	});
});
