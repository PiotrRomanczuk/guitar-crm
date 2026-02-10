/**
 * Tests for getUserWithRolesSSR
 * Using development credentials from development_credentials.txt
 */

import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server');

describe('getUserWithRolesSSR', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  describe('Admin User (p.romanczuk@gmail.com)', () => {
    it('returns user with admin and teacher roles', async () => {
      const mockUser = {
        id: 'admin-user-id',
        email: 'p.romanczuk@gmail.com',
        aud: 'authenticated',
        role: 'authenticated',
      };

      const mockProfile = {
        is_admin: true,
        is_teacher: true,
        is_student: false,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: mockUser,
        isAdmin: true,
        isTeacher: true,
        isStudent: false,
      });
    });
  });

  describe('Teacher User (teacher@example.com)', () => {
    it('returns user with teacher role only', async () => {
      const mockUser = {
        id: 'teacher-user-id',
        email: 'teacher@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      };

      const mockProfile = {
        is_admin: false,
        is_teacher: true,
        is_student: false,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: mockUser,
        isAdmin: false,
        isTeacher: true,
        isStudent: false,
      });
    });
  });

  describe('Student User (student@example.com)', () => {
    it('returns user with student role only', async () => {
      const mockUser = {
        id: 'student-user-id',
        email: 'student@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      };

      const mockProfile = {
        is_admin: false,
        is_teacher: false,
        is_student: true,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: mockUser,
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
      });
    });
  });

  describe('No User', () => {
    it('returns all roles false when no user is authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: null,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
      });
    });
  });

  describe('User with No Roles', () => {
    it('returns user with all roles false', async () => {
      const mockUser = {
        id: 'no-roles-user-id',
        email: 'user@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: mockUser,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
      });
    });
  });

  describe('Database Error', () => {
    it('returns user with all roles false on error', async () => {
      const mockUser = {
        id: 'error-user-id',
        email: 'error@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: mockUser,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
      });
    });
  });

  describe('Database Error', () => {
    it('handles profile fetch error gracefully', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST500', message: 'Database error' },
            }),
          }),
        }),
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: mockUser,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
      });
    });
  });

  describe('Authentication Error', () => {
    it('returns null user when auth fails', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      const result = await getUserWithRolesSSR();

      expect(result).toEqual({
        user: null,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
      });
    });
  });
});
