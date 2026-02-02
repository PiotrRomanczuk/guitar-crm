/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-lines-per-function */
/**
 * Teacher Dashboard Server Actions Tests
 *
 * Tests the teacher dashboard data fetching:
 * - getTeacherDashboardData - Fetch dashboard data for teachers
 *
 * @see app/actions/teacher/dashboard.ts
 */

import { getTeacherDashboardData } from '../teacher/dashboard';

// Mock getUserWithRolesSSR
const mockGetUserWithRolesSSR = jest.fn();
jest.mock('@/lib/getUserWithRolesSSR', () => ({
  getUserWithRolesSSR: () => mockGetUserWithRolesSSR(),
}));

// Mock Supabase client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockIn = jest.fn();
const mockLt = jest.fn();
const mockGt = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();
const mockSingle = jest.fn();

// mockFrom now controls the actual return behavior
const mockFrom = jest.fn((table: string) => {
  // Default fallback behavior
  return {
    select: () => ({
      eq: () => Promise.resolve({ data: [] }),
    }),
  };
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      from: (table: string) => mockFrom(table),
    })
  ),
}));

describe('getTeacherDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dashboard data for teacher', async () => {
    const teacherId = '123e4567-e89b-12d3-a456-426614174000';
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: { id: teacherId },
      isTeacher: true,
      isAdmin: false,
      isStudent: false,
    });

    // Create comprehensive mock that handles all query sequences
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [
                { user_id: 'student-1', role: 'student' },
                { user_id: 'student-2', role: 'student' },
              ],
            }),
          }),
        };
      }

      if (table === 'profiles') {
        return {
          select: () => ({
            in: () => Promise.resolve({
              data: [
                { id: 'student-1', full_name: 'John Doe', avatar_url: 'https://example.com/avatar1.jpg' },
                { id: 'student-2', full_name: 'Jane Smith', avatar_url: null },
              ],
            }),
          }),
        };
      }

      if (table === 'lessons') {
        return {
          select: (fields: string, options: any) => {
            if (options?.count === 'exact') {
              // Count query
              return {
                eq: () => ({
                  lt: () => Promise.resolve({ count: 5 }),
                }),
              };
            }
            // Next lesson query
            return {
              eq: () => ({
                gt: () => ({
                  order: () => ({
                    limit: () => ({
                      single: () => Promise.resolve({
                        data: { scheduled_at: '2026-02-15T10:00:00Z' },
                      }),
                    }),
                  }),
                }),
              }),
            };
          },
        };
      }

      // Fallback
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [] }),
        }),
      };
    });

    const result = await getTeacherDashboardData();

    expect(result).toHaveProperty('students');
    expect(result).toHaveProperty('activities');
    expect(result).toHaveProperty('chartData');
    expect(result).toHaveProperty('songs');
    expect(result).toHaveProperty('assignments');
    expect(result).toHaveProperty('stats');

    expect(result.students).toHaveLength(2);
    expect(result.students[0]).toEqual({
      id: 'student-1',
      name: 'John Doe',
      level: 'Intermediate',
      lessonsCompleted: 5,
      nextLesson: expect.any(String),
      avatar: 'https://example.com/avatar1.jpg',
    });

    expect(result.stats.totalStudents).toBe(2);
    expect(result.activities).toHaveLength(5);
    expect(result.chartData).toHaveLength(7);
  });

  it('should return dashboard data for admin', async () => {
    const adminId = '223e4567-e89b-12d3-a456-426614174001';
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: { id: adminId },
      isTeacher: false,
      isAdmin: true,
      isStudent: false,
    });

    // Mock empty student data
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: () => ({
              data: [],
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            in: () => ({
              data: [],
            }),
          }),
        };
      }
    });

    const result = await getTeacherDashboardData();

    expect(result.students).toHaveLength(0);
    expect(result.stats.totalStudents).toBe(0);
  });

  it('should reject student attempting to access', async () => {
    const studentId = '323e4567-e89b-12d3-a456-426614174002';
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: { id: studentId },
      isTeacher: false,
      isAdmin: false,
      isStudent: true,
    });

    await expect(getTeacherDashboardData()).rejects.toThrow('Unauthorized');

    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should reject unauthenticated user', async () => {
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: null,
      isTeacher: false,
      isAdmin: false,
      isStudent: false,
    });

    await expect(getTeacherDashboardData()).rejects.toThrow('Unauthorized');
  });

  it('should handle students with no lessons', async () => {
    const teacherId = '423e4567-e89b-12d3-a456-426614174003';
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: { id: teacherId },
      isTeacher: true,
      isAdmin: false,
      isStudent: false,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [{ user_id: 'student-1', role: 'student' }],
            }),
          }),
        };
      }

      if (table === 'profiles') {
        return {
          select: () => ({
            in: () => Promise.resolve({
              data: [{ id: 'student-1', full_name: 'New Student', avatar_url: null }],
            }),
          }),
        };
      }

      if (table === 'lessons') {
        return {
          select: (fields: string, options: any) => {
            if (options?.count === 'exact') {
              return {
                eq: () => ({
                  lt: () => Promise.resolve({ count: 0 }),
                }),
              };
            }
            return {
              eq: () => ({
                gt: () => ({
                  order: () => ({
                    limit: () => ({
                      single: () => Promise.resolve({ data: null }),
                    }),
                  }),
                }),
              }),
            };
          },
        };
      }

      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [] }),
        }),
      };
    });

    const result = await getTeacherDashboardData();

    expect(result.students).toHaveLength(1);
    expect(result.students[0].lessonsCompleted).toBe(0);
    expect(result.students[0].nextLesson).toBe('No upcoming lessons');
  });

  it('should handle student with unknown name', async () => {
    const teacherId = '523e4567-e89b-12d3-a456-426614174004';
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: { id: teacherId },
      isTeacher: true,
      isAdmin: false,
      isStudent: false,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [{ user_id: 'student-1', role: 'student' }],
            }),
          }),
        };
      }

      if (table === 'profiles') {
        return {
          select: () => ({
            in: () => Promise.resolve({
              data: [{ id: 'student-1', full_name: null, avatar_url: null }],
            }),
          }),
        };
      }

      if (table === 'lessons') {
        return {
          select: (fields: string, options: any) => {
            if (options?.count === 'exact') {
              return {
                eq: () => ({
                  lt: () => Promise.resolve({ count: 0 }),
                }),
              };
            }
            return {
              eq: () => ({
                gt: () => ({
                  order: () => ({
                    limit: () => ({
                      single: () => Promise.resolve({ data: null }),
                    }),
                  }),
                }),
              }),
            };
          },
        };
      }

      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [] }),
        }),
      };
    });

    const result = await getTeacherDashboardData();

    expect(result.students[0].name).toBe('Unknown');
  });

  it('should return mock data for activities, songs, and assignments', async () => {
    const teacherId = '623e4567-e89b-12d3-a456-426614174005';
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: { id: teacherId },
      isTeacher: true,
      isAdmin: false,
      isStudent: false,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: () => ({
              data: [],
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            in: () => ({
              data: [],
            }),
          }),
        };
      }
    });

    const result = await getTeacherDashboardData();

    // Verify mock data structure
    expect(result.activities).toHaveLength(5);
    expect(result.activities[0]).toHaveProperty('id');
    expect(result.activities[0]).toHaveProperty('type');
    expect(result.activities[0]).toHaveProperty('message');
    expect(result.activities[0]).toHaveProperty('time');

    expect(result.chartData).toHaveLength(7);
    expect(result.chartData[0]).toHaveProperty('name');
    expect(result.chartData[0]).toHaveProperty('lessons');
    expect(result.chartData[0]).toHaveProperty('assignments');

    expect(result.songs).toHaveLength(4);
    expect(result.songs[0]).toHaveProperty('difficulty');
    expect(['Easy', 'Medium', 'Hard']).toContain(result.songs[0].difficulty);

    expect(result.assignments).toHaveLength(4);
    expect(result.assignments[0]).toHaveProperty('status');
    expect(['pending', 'submitted', 'overdue', 'completed']).toContain(result.assignments[0].status);
  });

  it('should calculate stats correctly', async () => {
    const teacherId = '723e4567-e89b-12d3-a456-426614174006';
    mockGetUserWithRolesSSR.mockResolvedValue({
      user: { id: teacherId },
      isTeacher: true,
      isAdmin: false,
      isStudent: false,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [
                { user_id: 'student-1', role: 'student' },
                { user_id: 'student-2', role: 'student' },
                { user_id: 'student-3', role: 'student' },
              ],
            }),
          }),
        };
      }

      if (table === 'profiles') {
        return {
          select: () => ({
            in: () => Promise.resolve({
              data: [
                { id: 'student-1', full_name: 'Student 1', avatar_url: null },
                { id: 'student-2', full_name: 'Student 2', avatar_url: null },
                { id: 'student-3', full_name: 'Student 3', avatar_url: null },
              ],
            }),
          }),
        };
      }

      if (table === 'lessons') {
        return {
          select: (fields: string, options: any) => {
            if (options?.count === 'exact') {
              return {
                eq: () => ({
                  lt: () => Promise.resolve({ count: 0 }),
                }),
              };
            }
            return {
              eq: () => ({
                gt: () => ({
                  order: () => ({
                    limit: () => ({
                      single: () => Promise.resolve({ data: null }),
                    }),
                  }),
                }),
              }),
            };
          },
        };
      }

      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [] }),
        }),
      };
    });

    const result = await getTeacherDashboardData();

    expect(result.stats).toEqual({
      totalStudents: 3,
      songsInLibrary: 48,
      lessonsThisWeek: 32,
      pendingAssignments: 8,
    });
  });
});
