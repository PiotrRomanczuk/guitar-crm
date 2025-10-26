import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { ReactNode } from 'react';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
	supabase: {
		auth: {
			getSession: jest.fn(),
			onAuthStateChange: jest.fn(),
			signOut: jest.fn(),
		},
	},
}));

import { supabase } from '@/lib/supabase';

describe('AuthProvider', () => {
	const wrapper = ({ children }: { children: ReactNode }) => (
		<AuthProvider>{children}</AuthProvider>
	);

	beforeEach(() => {
		jest.clearAllMocks();
		(supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
			data: { subscription: { unsubscribe: jest.fn() } },
		});
	});

	describe('Initialization', () => {
		it('should initialize with loading state', () => {
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: null },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			expect(result.current.loading).toBe(true);
			expect(result.current.user).toBe(null);
			expect(result.current.session).toBe(null);
		});

		it('should load existing session on mount', async () => {
			const mockSession = {
				access_token: 'token',
				user: { id: '123', email: 'test@example.com' },
			};

			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: mockSession },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.user).toEqual(mockSession.user);
			expect(result.current.session).toEqual(mockSession);
		});

		it('should set up auth state change listener', () => {
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: null },
				error: null,
			});

			renderHook(() => useAuth(), { wrapper });

			expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
		});
	});

	describe('Authentication State', () => {
		it('should update state when user signs in', async () => {
			const mockSession = {
				access_token: 'token',
				user: { id: '123', email: 'test@example.com' },
			};

			let authCallback: (event: string, session: unknown) => void = () => {};
			(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
				(callback) => {
					authCallback = callback;
					return { data: { subscription: { unsubscribe: jest.fn() } } };
				}
			);
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: null },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			act(() => {
				authCallback('SIGNED_IN', mockSession);
			});

			expect(result.current.user).toEqual(mockSession.user);
			expect(result.current.session).toEqual(mockSession);
		});

		it('should update state when user signs out', async () => {
			const mockSession = {
				access_token: 'token',
				user: { id: '123', email: 'test@example.com' },
			};

			let authCallback: (event: string, session: unknown) => void = () => {};
			(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
				(callback) => {
					authCallback = callback;
					return { data: { subscription: { unsubscribe: jest.fn() } } };
				}
			);
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: mockSession },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.user).toEqual(mockSession.user);
			});

			act(() => {
				authCallback('SIGNED_OUT', null);
			});

			expect(result.current.user).toBe(null);
			expect(result.current.session).toBe(null);
		});

		it('should handle token refresh', async () => {
			const oldSession = {
				access_token: 'old_token',
				user: { id: '123', email: 'test@example.com' },
			};
			const newSession = {
				access_token: 'new_token',
				user: { id: '123', email: 'test@example.com' },
			};

			let authCallback: (event: string, session: unknown) => void = () => {};
			(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
				(callback) => {
					authCallback = callback;
					return { data: { subscription: { unsubscribe: jest.fn() } } };
				}
			);
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: oldSession },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.session?.access_token).toBe('old_token');
			});

			act(() => {
				authCallback('TOKEN_REFRESHED', newSession);
			});

			expect(result.current.session?.access_token).toBe('new_token');
		});
	});

	describe('Sign Out', () => {
		it('should call supabase signOut when signOut is called', async () => {
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: null },
				error: null,
			});
			(supabase.auth.signOut as jest.Mock).mockResolvedValue({
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			await act(async () => {
				await result.current.signOut();
			});

			expect(supabase.auth.signOut).toHaveBeenCalled();
		});

		it('should clear user state after sign out', async () => {
			const mockSession = {
				access_token: 'token',
				user: { id: '123', email: 'test@example.com' },
			};

			let authCallback: (event: string, session: unknown) => void = () => {};
			(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
				(callback) => {
					authCallback = callback;
					return { data: { subscription: { unsubscribe: jest.fn() } } };
				}
			);
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: mockSession },
				error: null,
			});
			(supabase.auth.signOut as jest.Mock).mockResolvedValue({
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.user).toEqual(mockSession.user);
			});

			await act(async () => {
				await result.current.signOut();
			});

			// Simulate the auth state change event
			act(() => {
				authCallback('SIGNED_OUT', null);
			});

			expect(result.current.user).toBe(null);
			expect(result.current.session).toBe(null);
		});
	});

	describe('Role Checking', () => {
		it('should correctly identify admin users', async () => {
			const mockSession = {
				access_token: 'token',
				user: {
					id: '123',
					email: 'admin@example.com',
					user_metadata: { isAdmin: true },
				},
			};

			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: mockSession },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.isAdmin).toBe(true);
		});

		it('should correctly identify teacher users', async () => {
			const mockSession = {
				access_token: 'token',
				user: {
					id: '123',
					email: 'teacher@example.com',
					user_metadata: { isTeacher: true },
				},
			};

			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: mockSession },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.isTeacher).toBe(true);
		});

		it('should correctly identify student users', async () => {
			const mockSession = {
				access_token: 'token',
				user: {
					id: '123',
					email: 'student@example.com',
					user_metadata: { isStudent: true },
				},
			};

			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: mockSession },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.isStudent).toBe(true);
		});

		it('should handle users with multiple roles', async () => {
			const mockSession = {
				access_token: 'token',
				user: {
					id: '123',
					email: 'multi@example.com',
					user_metadata: {
						isTeacher: true,
						isStudent: true,
						isAdmin: false,
					},
				},
			};

			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: mockSession },
				error: null,
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.isTeacher).toBe(true);
			expect(result.current.isStudent).toBe(true);
			expect(result.current.isAdmin).toBe(false);
		});
	});

	describe('Cleanup', () => {
		it('should unsubscribe from auth state changes on unmount', () => {
			const unsubscribeMock = jest.fn();
			(supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
				data: { subscription: { unsubscribe: unsubscribeMock } },
			});
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: null },
				error: null,
			});

			const { unmount } = renderHook(() => useAuth(), { wrapper });

			unmount();

			expect(unsubscribeMock).toHaveBeenCalled();
		});
	});
});
