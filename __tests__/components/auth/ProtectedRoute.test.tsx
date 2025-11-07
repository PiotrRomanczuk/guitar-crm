import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

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

describe('ProtectedRoute', () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseRouter.mockReturnValue({
			push: mockPush,
		} as unknown as AppRouterInstance);
	});

	it('should render children when user is authenticated', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user' } as User,
			session: {} as Session,
			loading: false,
			signOut: jest.fn(),
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(
			<ProtectedRoute>
				<div>Protected Content</div>
			</ProtectedRoute>
		);

		expect(screen.getByText('Protected Content')).toBeInTheDocument();
	});

	it('should show loading state when auth is loading', () => {
		mockUseAuth.mockReturnValue({
			user: null,
			session: null,
			loading: true,
			signOut: jest.fn(),
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(
			<ProtectedRoute>
				<div>Protected Content</div>
			</ProtectedRoute>
		);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it('should redirect to sign-in when user is not authenticated', () => {
		mockUseAuth.mockReturnValue({
			user: null,
			session: null,
			loading: false,
			signOut: jest.fn(),
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(
			<ProtectedRoute>
				<div>Protected Content</div>
			</ProtectedRoute>
		);

		expect(mockPush).toHaveBeenCalledWith('/sign-in');
	});

	it('should redirect to sign-in when requireAdmin is true and user is not admin', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user' } as User,
			session: {} as Session,
			loading: false,
			signOut: jest.fn(),
			isAdmin: false,
			isTeacher: true,
			isStudent: false,
		});

		render(
			<ProtectedRoute requireAdmin>
				<div>Admin Content</div>
			</ProtectedRoute>
		);

		expect(mockPush).toHaveBeenCalledWith('/sign-in');
	});

	it('should render children when requireAdmin is true and user is admin', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user' } as User,
			session: {} as Session,
			loading: false,
			signOut: jest.fn(),
			isAdmin: true,
			isTeacher: false,
			isStudent: false,
		});

		render(
			<ProtectedRoute requireAdmin>
				<div>Admin Content</div>
			</ProtectedRoute>
		);

		expect(screen.getByText('Admin Content')).toBeInTheDocument();
	});

	it('should redirect to sign-in when requireTeacher is true and user is not teacher', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user' } as User,
			session: {} as Session,
			loading: false,
			signOut: jest.fn(),
			isAdmin: false,
			isTeacher: false,
			isStudent: true,
		});

		render(
			<ProtectedRoute requireTeacher>
				<div>Teacher Content</div>
			</ProtectedRoute>
		);

		expect(mockPush).toHaveBeenCalledWith('/sign-in');
	});

	it('should render children when requireTeacher is true and user is teacher', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user' } as User,
			session: {} as Session,
			loading: false,
			signOut: jest.fn(),
			isAdmin: false,
			isTeacher: true,
			isStudent: false,
		});

		render(
			<ProtectedRoute requireTeacher>
				<div>Teacher Content</div>
			</ProtectedRoute>
		);

		expect(screen.getByText('Teacher Content')).toBeInTheDocument();
	});

	it('should allow admins to access teacher-only content', () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'test-user' } as User,
			session: {} as Session,
			loading: false,
			signOut: jest.fn(),
			isAdmin: true,
			isTeacher: false,
			isStudent: false,
		});

		render(
			<ProtectedRoute requireTeacher>
				<div>Teacher Content</div>
			</ProtectedRoute>
		);

		expect(screen.getByText('Teacher Content')).toBeInTheDocument();
	});

	it('should use custom redirect path when provided', () => {
		mockUseAuth.mockReturnValue({
			user: null,
			session: null,
			loading: false,
			signOut: jest.fn(),
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		});

		render(
			<ProtectedRoute redirectTo='/custom-login'>
				<div>Protected Content</div>
			</ProtectedRoute>
		);

		expect(mockPush).toHaveBeenCalledWith('/custom-login');
	});
});
