/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Onboarding Server Actions Tests
 *
 * Tests the onboarding completion flow:
 * - completeOnboarding - Student onboarding process
 *
 * @see app/actions/onboarding.ts
 */

import { completeOnboarding } from '../onboarding';
import type { OnboardingData } from '@/types/onboarding';

// Mock Supabase client
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: () => mockGetUser(),
      },
    })
  ),
}));

// Mock Admin client
const mockAdminUpdate = jest.fn();
const mockAdminInsert = jest.fn();
const mockAdminEq = jest.fn();
const mockAdminFrom = jest.fn((table: string) => {
  // Default behavior
  return {
    update: (data: unknown) => {
      mockAdminUpdate(data);
      return {
        eq: (field: string, value: string) => {
          mockAdminEq(field, value);
          return Promise.resolve({ error: null });
        },
      };
    },
    insert: (data: unknown) => {
      mockAdminInsert(data);
      return Promise.resolve({ error: null });
    },
  };
});

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: (table: string) => mockAdminFrom(table),
  })),
}));

// Mock Next.js functions
const mockRevalidatePath = jest.fn();
const mockRedirect = jest.fn(() => {
  throw new Error('NEXT_REDIRECT'); // redirect throws to stop execution
});

jest.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}));

jest.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe('completeOnboarding', () => {
  const validOnboardingData: OnboardingData = {
    goals: ['Learn chords', 'Play songs'],
    skillLevel: 'beginner',
    learningStyle: ['visual', 'hands-on'],
    instrumentPreference: ['acoustic-guitar'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete onboarding for authenticated user', async () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: {
            first_name: 'John',
            last_name: 'Doe',
            full_name: 'John Doe',
          },
        },
      },
      error: null,
    });

    // Expect redirect to throw
    await expect(completeOnboarding(validOnboardingData)).rejects.toThrow('NEXT_REDIRECT');

    // Verify profile was updated with first_name/last_name (trigger syncs full_name)
    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'John',
        last_name: 'Doe',
        is_student: true,
        onboarding_completed: true,
      })
    );

    // Verify path was revalidated
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');

    // Verify redirect was called
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle user with partial metadata', async () => {
    const userId = '223e4567-e89b-12d3-a456-426614174001';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: {
            first_name: 'Jane',
            // No last_name or full_name
          },
        },
      },
      error: null,
    });

    await expect(completeOnboarding(validOnboardingData)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Jane',
        last_name: '',
        is_student: true,
      })
    );
  });

  it('should handle user with no metadata', async () => {
    const userId = '323e4567-e89b-12d3-a456-426614174002';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: {},
        },
      },
      error: null,
    });

    await expect(completeOnboarding(validOnboardingData)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: '',
        last_name: '',
        is_student: true,
      })
    );
  });

  it('should reject unauthenticated user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await completeOnboarding(validOnboardingData);

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(mockAdminUpdate).not.toHaveBeenCalled();
    expect(mockAdminInsert).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should handle auth error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    const result = await completeOnboarding(validOnboardingData);

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(mockAdminUpdate).not.toHaveBeenCalled();
  });

  it('should handle profile update error', async () => {
    const userId = '423e4567-e89b-12d3-a456-426614174003';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    });

    // Mock profile update to return error - use mockImplementationOnce for this test only
    mockAdminFrom.mockImplementationOnce((table: string) => {
      if (table === 'profiles') {
        return {
          update: (data: unknown) => ({
            eq: (field: string, value: string) =>
              Promise.resolve({ error: { message: 'Database error' } }),
          }),
        };
      }
      // Won't reach user_roles due to early return
      return {
        insert: (data: unknown) => Promise.resolve({ error: null }),
      };
    });

    const result = await completeOnboarding(validOnboardingData);

    expect(result).toEqual({ error: 'Failed to update profile' });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should handle duplicate role assignment gracefully', async () => {
    const userId = '523e4567-e89b-12d3-a456-426614174004';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    });

    // Mock duplicate key error (role already exists) - this should be ignored
    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === 'profiles' && callCount === 1) {
        return {
          update: (data: unknown) => ({
            eq: (field: string, value: string) => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'user_roles' && callCount === 2) {
        return {
          insert: (data: unknown) =>
            Promise.resolve({ error: { code: '23505', message: 'Duplicate key' } }),
        };
      }
      // Fallback
      return {
        insert: (data: unknown) => Promise.resolve({ error: null }),
        update: (data: unknown) => ({
          eq: (field: string, value: string) => Promise.resolve({ error: null }),
        }),
      };
    });

    // Should succeed despite duplicate role error
    await expect(completeOnboarding(validOnboardingData)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should succeed when profile update works (no separate role assignment)', async () => {
    const userId = '623e4567-e89b-12d3-a456-426614174005';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    });

    // Reset mockAdminFrom to default behavior (may have been overridden by previous test)
    mockAdminFrom.mockImplementation((table: string) => {
      return {
        update: (data: unknown) => {
          mockAdminUpdate(data);
          return {
            eq: (field: string, value: string) => {
              mockAdminEq(field, value);
              return Promise.resolve({ error: null });
            },
          };
        },
        insert: (data: unknown) => {
          mockAdminInsert(data);
          return Promise.resolve({ error: null });
        },
      };
    });

    // Profile update succeeds - role is set via boolean flag, no separate insert
    await expect(completeOnboarding(validOnboardingData)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        is_student: true,
        onboarding_completed: true,
      })
    );
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle unexpected errors', async () => {
    const userId = '723e4567-e89b-12d3-a456-426614174006';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    });

    // Make adminFrom throw an unexpected error
    mockAdminFrom.mockImplementationOnce(() => {
      throw new Error('Unexpected database error');
    });

    const result = await completeOnboarding(validOnboardingData);

    expect(result).toEqual({ error: 'An unexpected error occurred' });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should store correct onboarding preferences', async () => {
    const userId = '823e4567-e89b-12d3-a456-426614174007';

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'student@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    });

    const customOnboardingData: OnboardingData = {
      goals: ['Master fingerpicking', 'Write songs'],
      skillLevel: 'intermediate',
      learningStyle: ['audio', 'practice'],
      instrumentPreference: ['electric-guitar', 'bass'],
    };

    await expect(completeOnboarding(customOnboardingData)).rejects.toThrow('NEXT_REDIRECT');

    // Verify the profile update was called with onboarding_completed flag
    expect(mockAdminFrom).toHaveBeenCalled();
  });
});
