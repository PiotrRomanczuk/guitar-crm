import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '@/components/navigation/Header';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock the auth hook
jest.mock('@/components/auth/AuthProvider', () => ({
	useAuth: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Header', () => {
	const mockPush = jest.fn();
	const mockSignOut = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseRouter.mockReturnValue({
			push: mockPush,
		} as never);
	});

	it('should render sign in and sign up buttons when user is not authenticated', () => {
		mockUseAuth.mockReturnValue({
			user: null,
			session: null,
			loading: false,
			signOut: mockSignOut,
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(<Header />);

		expect(screen.getByText('Sign In')).toBeInTheDocument();
		expect(screen.getByText('Sign Up')).toBeInTheDocument();
	});

	it('should render user email when authenticated', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user', email: 'test@example.com' } as never,
			session: {} as never,
			loading: false,
			signOut: mockSignOut,
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(<Header />);

		expect(screen.getByText('test@example.com')).toBeInTheDocument();
	});

	it('should call signOut when sign out button is clicked', async () => {
		mockSignOut.mockResolvedValue(undefined);
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user', email: 'test@example.com' } as never,
			session: {} as never,
			loading: false,
			signOut: mockSignOut,
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(<Header />);

		const signOutButton = screen.getByText('Sign Out');
		fireEvent.click(signOutButton);

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalled();
		});
	});

	it('should navigate to home when logo is clicked', () => {
		mockUseAuth.mockReturnValue({
			user: null,
			session: null,
			loading: false,
			signOut: mockSignOut,
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(<Header />);

		const logo = screen.getByText('🎸 Guitar CRM');
		fireEvent.click(logo);

		expect(mockPush).toHaveBeenCalledWith('/');
	});

	it('should show role badges for authenticated users', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user', email: 'test@example.com' } as never,
			session: {} as never,
			loading: false,
			signOut: mockSignOut,
			isAdmin: true,
			isTeacher: true,
			isStudent: false,
		});

		render(<Header />);

		expect(screen.getByText('Admin')).toBeInTheDocument();
		expect(screen.getByText('Teacher')).toBeInTheDocument();
	});

	it('should not show sign in/up buttons when loading', () => {
		mockUseAuth.mockReturnValue({
			user: null,
			session: null,
			loading: true,
			signOut: mockSignOut,
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(<Header />);

		expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
		expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
	});
});
