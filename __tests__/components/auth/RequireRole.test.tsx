import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import {
	RequireAdmin,
	RequireTeacher,
	RequireStudent,
	RequireAuth,
} from '@/components/auth';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

// Mock AuthProvider hook
jest.mock('@/components/auth/AuthProvider', () => ({
	useAuth: jest.fn(),
}));

import { useAuth } from '@/components/auth/AuthProvider';

describe('Role-based Route Protection', () => {
	const mockPush = jest.fn();
	const mockRouter = { push: mockPush };

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	describe('RequireAuth', () => {
		it('should render children when user is authenticated', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'test@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: true,
			});

			render(
				<RequireAuth>
					<div>Protected Content</div>
				</RequireAuth>
			);

			expect(screen.getByText('Protected Content')).toBeInTheDocument();
		});

		it('should show loading state when auth is loading', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: null,
				loading: true,
				isAdmin: false,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireAuth>
					<div>Protected Content</div>
				</RequireAuth>
			);

			expect(screen.getByText(/loading/i)).toBeInTheDocument();
		});

		it('should redirect to sign-in when user is not authenticated', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: null,
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireAuth>
					<div>Protected Content</div>
				</RequireAuth>
			);

			expect(mockPush).toHaveBeenCalledWith('/sign-in');
		});
	});

	describe('RequireAdmin', () => {
		it('should render children when user is admin', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'admin@example.com' },
				loading: false,
				isAdmin: true,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireAdmin>
					<div>Admin Content</div>
				</RequireAdmin>
			);

			expect(screen.getByText('Admin Content')).toBeInTheDocument();
		});

		it('should redirect non-admin to home when authenticated', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'student@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: true,
			});

			render(
				<RequireAdmin>
					<div>Admin Content</div>
				</RequireAdmin>
			);

			expect(mockPush).toHaveBeenCalledWith('/');
			expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
		});

		it('should redirect to sign-in when not authenticated', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: null,
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireAdmin>
					<div>Admin Content</div>
				</RequireAdmin>
			);

			expect(mockPush).toHaveBeenCalledWith('/sign-in');
		});

		it('should show loading state while checking auth', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: null,
				loading: true,
				isAdmin: false,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireAdmin>
					<div>Admin Content</div>
				</RequireAdmin>
			);

			expect(screen.getByText(/loading/i)).toBeInTheDocument();
		});
	});

	describe('RequireTeacher', () => {
		it('should render children when user is teacher', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'teacher@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: true,
				isStudent: false,
			});

			render(
				<RequireTeacher>
					<div>Teacher Content</div>
				</RequireTeacher>
			);

			expect(screen.getByText('Teacher Content')).toBeInTheDocument();
		});

		it('should allow admin access (admin can do everything)', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'admin@example.com' },
				loading: false,
				isAdmin: true,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireTeacher>
					<div>Teacher Content</div>
				</RequireTeacher>
			);

			expect(screen.getByText('Teacher Content')).toBeInTheDocument();
		});

		it('should redirect non-teacher to home', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'student@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: true,
			});

			render(
				<RequireTeacher>
					<div>Teacher Content</div>
				</RequireTeacher>
			);

			expect(mockPush).toHaveBeenCalledWith('/');
		});

		it('should handle users with multiple roles (teacher + student)', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'both@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: true,
				isStudent: true,
			});

			render(
				<RequireTeacher>
					<div>Teacher Content</div>
				</RequireTeacher>
			);

			expect(screen.getByText('Teacher Content')).toBeInTheDocument();
		});
	});

	describe('RequireStudent', () => {
		it('should render children when user is student', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'student@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: true,
			});

			render(
				<RequireStudent>
					<div>Student Content</div>
				</RequireStudent>
			);

			expect(screen.getByText('Student Content')).toBeInTheDocument();
		});

		it('should allow admin access', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'admin@example.com' },
				loading: false,
				isAdmin: true,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireStudent>
					<div>Student Content</div>
				</RequireStudent>
			);

			expect(screen.getByText('Student Content')).toBeInTheDocument();
		});

		it('should redirect non-student to home', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'teacher@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: true,
				isStudent: false,
			});

			render(
				<RequireStudent>
					<div>Student Content</div>
				</RequireStudent>
			);

			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});

	describe('Custom redirect paths', () => {
		it('should support custom redirect path for RequireAdmin', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: { id: '123', email: 'student@example.com' },
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: true,
			});

			render(
				<RequireAdmin redirectTo='/unauthorized'>
					<div>Admin Content</div>
				</RequireAdmin>
			);

			expect(mockPush).toHaveBeenCalledWith('/unauthorized');
		});

		it('should support custom redirect for unauthenticated users', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: null,
				loading: false,
				isAdmin: false,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireAdmin redirectTo='/custom-login'>
					<div>Admin Content</div>
				</RequireAdmin>
			);

			expect(mockPush).toHaveBeenCalledWith('/custom-login');
		});
	});

	describe('Loading customization', () => {
		it('should support custom loading component', () => {
			(useAuth as jest.Mock).mockReturnValue({
				user: null,
				loading: true,
				isAdmin: false,
				isTeacher: false,
				isStudent: false,
			});

			render(
				<RequireAuth loadingComponent={<div>Custom Loading...</div>}>
					<div>Protected Content</div>
				</RequireAuth>
			);

			expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
		});
	});
});
