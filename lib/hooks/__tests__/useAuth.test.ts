/**
 * useAuth Hook Tests
 *
 * Tests the authentication hook functionality:
 * - Initial loading state
 * - User authentication states
 * - Role checking (admin, teacher, student)
 * - Auth state changes
 * - Error handling
 *
 * @see lib/hooks/useAuth.ts
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, useHasRole, useHasAnyRole } from '../useAuth';

// Suppress act() warnings and useAuth error logging from async state updates in hooks
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Suppress act() warnings and useAuth internal error logs during tests
    if (
      args[0]?.includes?.('not wrapped in act') ||
      args[0]?.includes?.('[useAuth]')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

// Mock Supabase client
const mockGetUser = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  }),
}));

describe('useAuth', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
  };

  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  // Helper to setup the chain of mocks for profile fetching
  // Source queries: supabase.from('profiles').select('is_admin, is_teacher, is_student').eq('id', user.id).single()
  const setupProfileMocks = (profileResult: { data: unknown; error: unknown }) => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(profileResult),
        }),
      }),
    });
  };

  describe('Initial State', () => {
    it('should start in loading state', () => {
      // Don't resolve getUser yet
      mockGetUser.mockReturnValue(new Promise(() => {}));
      setupProfileMocks({ data: null, error: null });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Unauthenticated State', () => {
    it('should return null user when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      setupProfileMocks({ data: null, error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.isStudent).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Authenticated State with Roles', () => {
    it('should fetch admin role from profiles table', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      setupProfileMocks({
        data: { is_admin: true, is_teacher: false, is_student: false },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.isStudent).toBe(false);
    });

    it('should fetch teacher role from profiles table', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      setupProfileMocks({
        data: { is_admin: false, is_teacher: true, is_student: false },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isTeacher).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isStudent).toBe(false);
    });

    it('should fetch student role from profiles table', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      setupProfileMocks({
        data: { is_admin: false, is_teacher: false, is_student: true },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isStudent).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isTeacher).toBe(false);
    });

    it('should handle multiple roles', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      setupProfileMocks({
        data: { is_admin: true, is_teacher: true, is_student: false },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isTeacher).toBe(true);
      expect(result.current.isStudent).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle auth errors', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });
      setupProfileMocks({ data: null, error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Auth error');
      expect(result.current.user).toBeNull();
    });

    it('should handle role fetch errors gracefully', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      setupProfileMocks({ data: null, error: { message: 'Database error' } });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still have user but default roles
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.isStudent).toBe(false);
    });
  });

  describe('Auth State Listener', () => {
    it('should setup auth state change listener', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      setupProfileMocks({ data: null, error: null });

      renderHook(() => useAuth());

      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    it('should cleanup subscription on unmount', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      setupProfileMocks({ data: null, error: null });

      const { unmount } = renderHook(() => useAuth());

      // Wait for initial load
      await waitFor(() => {});

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});

describe('useHasRole', () => {
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  const setupMocks = (user: unknown, profileResult: { data: unknown; error: unknown }) => {
    mockGetUser.mockResolvedValue({ data: { user }, error: null });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(profileResult),
        }),
      }),
    });
  };

  it('should return true when user has admin role', async () => {
    setupMocks(
      { id: 'test-id', email: 'admin@example.com' },
      { data: { is_admin: true, is_teacher: false, is_student: false }, error: null }
    );

    const { result } = renderHook(() => useHasRole('admin'));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false when user does not have admin role', async () => {
    setupMocks(
      { id: 'test-id', email: 'student@example.com' },
      { data: { is_admin: false, is_teacher: false, is_student: true }, error: null }
    );

    const { result } = renderHook(() => useHasRole('admin'));

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return true for teacher role', async () => {
    setupMocks(
      { id: 'test-id', email: 'teacher@example.com' },
      { data: { is_admin: false, is_teacher: true, is_student: false }, error: null }
    );

    const { result } = renderHook(() => useHasRole('teacher'));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return true for student role', async () => {
    setupMocks(
      { id: 'test-id', email: 'student@example.com' },
      { data: { is_admin: false, is_teacher: false, is_student: true }, error: null }
    );

    const { result } = renderHook(() => useHasRole('student'));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe('useHasAnyRole', () => {
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  const setupMocks = (user: unknown, profileResult: { data: unknown; error: unknown }) => {
    mockGetUser.mockResolvedValue({ data: { user }, error: null });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(profileResult),
        }),
      }),
    });
  };

  it('should return true when user has any of the specified roles', async () => {
    setupMocks(
      { id: 'test-id', email: 'teacher@example.com' },
      { data: { is_admin: false, is_teacher: true, is_student: false }, error: null }
    );

    const { result } = renderHook(() => useHasAnyRole(['admin', 'teacher']));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false when user has none of the specified roles', async () => {
    setupMocks(
      { id: 'test-id', email: 'student@example.com' },
      { data: { is_admin: false, is_teacher: false, is_student: true }, error: null }
    );

    const { result } = renderHook(() => useHasAnyRole(['admin', 'teacher']));

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return true when user has one of multiple specified roles', async () => {
    setupMocks(
      { id: 'test-id', email: 'admin@example.com' },
      { data: { is_admin: true, is_teacher: false, is_student: false }, error: null }
    );

    const { result } = renderHook(() => useHasAnyRole(['admin', 'teacher', 'student']));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
