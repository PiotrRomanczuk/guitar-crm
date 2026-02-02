/**
 * Dashboard Server Actions Security Tests
 *
 * CRITICAL: Tests authorization for user invite and shadow user creation.
 * These functions were previously vulnerable to privilege escalation.
 *
 * Tests:
 * - inviteUser() - Only admins can invite users
 * - createShadowUser() - Only teachers/admins can create shadow users
 *
 * @see app/dashboard/actions.ts
 */

import { inviteUser, createShadowUser } from '../../dashboard/actions';

// Mock createClient
const mockGetUser = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: () => mockGetUser(),
      },
      from: (table: string) => {
        mockFrom(table);
        return {
          select: (fields: string) => {
            mockSelect(fields);
            return {
              eq: (field: string, value: string) => {
                mockEq(field, value);
                return {
                  single: () => mockSingle(),
                };
              },
            };
          },
        };
      },
    })
  ),
}));

// Mock createAdminClient
const mockAdminListUsers = jest.fn();
const mockAdminInviteUserByEmail = jest.fn();
const mockAdminUpdate = jest.fn();
const mockAdminEq = jest.fn();
const mockAdminGenerateLink = jest.fn();
const mockAdminCreateUser = jest.fn();
const mockAdminUpdateUserById = jest.fn();
const mockAdminUpsert = jest.fn();

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    auth: {
      admin: {
        listUsers: () => mockAdminListUsers(),
        inviteUserByEmail: (email: string) => mockAdminInviteUserByEmail(email),
        generateLink: (options: unknown) => mockAdminGenerateLink(options),
        createUser: (options: unknown) => mockAdminCreateUser(options),
        updateUserById: (userId: string, data: unknown) =>
          mockAdminUpdateUserById(userId, data),
      },
    },
    from: (table: string) => ({
      update: (data: unknown) => {
        mockAdminUpdate(data);
        return {
          eq: (field: string, value: string) => {
            mockAdminEq(field, value);
            return Promise.resolve({ error: null });
          },
        };
      },
      upsert: (data: unknown, options?: unknown) => {
        mockAdminUpsert(data, options);
        return Promise.resolve({ error: null });
      },
      select: (fields: string) => ({
        eq: (field: string, value: string) => ({
          single: () => Promise.resolve({ data: null }),
        }),
      }),
    }),
  })),
}));

// Mock google modules
jest.mock('@/lib/google', () => ({
  getGoogleOAuth2Client: jest.fn(),
}));

jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn(),
  },
  calendar_v3: {},
}));

describe('inviteUser - Authorization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow admin to invite student', async () => {
    // Mock authenticated admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'admin@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: true },
    });

    mockAdminListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockAdminInviteUserByEmail.mockResolvedValue({
      data: { user: { id: 'new-student-id' } },
      error: null,
    });

    const result = await inviteUser('student@example.com', 'New Student', 'student');

    expect(result.success).toBe(true);
    expect(mockAdminInviteUserByEmail).toHaveBeenCalledWith('student@example.com');
  });

  it('should allow admin to invite teacher', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'admin@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: true },
    });

    mockAdminListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockAdminInviteUserByEmail.mockResolvedValue({
      data: { user: { id: 'new-teacher-id' } },
      error: null,
    });

    const result = await inviteUser('teacher@example.com', 'New Teacher', 'teacher');

    expect(result.success).toBe(true);
  });

  it('should allow admin to invite admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'admin@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: true },
    });

    mockAdminListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockAdminInviteUserByEmail.mockResolvedValue({
      data: { user: { id: 'new-admin-id' } },
      error: null,
    });

    const result = await inviteUser('newadmin@example.com', 'New Admin', 'admin');

    expect(result.success).toBe(true);
    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        is_admin: true,
        is_teacher: false,
        is_student: false,
      })
    );
  });

  it('should reject teacher attempting to invite users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'teacher-id', email: 'teacher@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: false },
    });

    await expect(inviteUser('student@example.com', 'New Student', 'student')).rejects.toThrow(
      'Unauthorized: Only admins can invite users'
    );

    // Should not reach admin client
    expect(mockAdminInviteUserByEmail).not.toHaveBeenCalled();
  });

  it('should reject student attempting to invite users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'student-id', email: 'student@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: false },
    });

    await expect(inviteUser('friend@example.com', 'Friend', 'student')).rejects.toThrow(
      'Unauthorized: Only admins can invite users'
    );

    expect(mockAdminInviteUserByEmail).not.toHaveBeenCalled();
  });

  it('should reject unauthenticated requests', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    await expect(inviteUser('student@example.com', 'New Student', 'student')).rejects.toThrow(
      'Unauthorized: Authentication required'
    );

    expect(mockAdminInviteUserByEmail).not.toHaveBeenCalled();
  });

  it('should reject when profile lookup fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id', email: 'user@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: null, // No profile found
    });

    await expect(inviteUser('student@example.com', 'New Student', 'student')).rejects.toThrow(
      'Unauthorized: Only admins can invite users'
    );
  });
});

describe('createShadowUser - Authorization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow admin to create shadow user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'admin@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: true, is_teacher: false },
    });

    mockAdminListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockAdminGenerateLink.mockResolvedValue({
      data: { user: { id: 'shadow-user-id', email_confirmed_at: null } },
      error: null,
    });

    const result = await createShadowUser('shadow@example.com');

    expect(result.success).toBe(true);
    expect(result.userId).toBe('shadow-user-id');
    expect(mockAdminUpsert).toHaveBeenCalled();
  });

  it('should allow teacher to create shadow user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'teacher-id', email: 'teacher@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: false, is_teacher: true },
    });

    mockAdminListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockAdminGenerateLink.mockResolvedValue({
      data: { user: { id: 'shadow-user-id', email_confirmed_at: null } },
      error: null,
    });

    const result = await createShadowUser('shadow@example.com');

    expect(result.success).toBe(true);
  });

  it('should reject student attempting to create shadow user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'student-id', email: 'student@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: false, is_teacher: false },
    });

    await expect(createShadowUser('shadow@example.com')).rejects.toThrow(
      'Unauthorized: Only teachers and admins can create shadow users'
    );

    // Should not reach admin client
    expect(mockAdminGenerateLink).not.toHaveBeenCalled();
    expect(mockAdminCreateUser).not.toHaveBeenCalled();
  });

  it('should reject unauthenticated requests', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    await expect(createShadowUser('shadow@example.com')).rejects.toThrow('Unauthorized');

    expect(mockAdminGenerateLink).not.toHaveBeenCalled();
  });

  it('should reject when profile lookup fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id', email: 'user@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: null, // No profile found
    });

    await expect(createShadowUser('shadow@example.com')).rejects.toThrow(
      'Unauthorized: Only teachers and admins can create shadow users'
    );
  });
});

describe('Authorization Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inviteUser - should handle null is_admin gracefully', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id', email: 'user@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: { is_admin: null }, // Null instead of false
    });

    await expect(inviteUser('student@example.com', 'Student', 'student')).rejects.toThrow(
      'Unauthorized'
    );
  });

  it('createShadowUser - should handle missing role fields', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id', email: 'user@example.com' } },
    });

    mockSingle.mockResolvedValue({
      data: {}, // Empty profile
    });

    await expect(createShadowUser('shadow@example.com')).rejects.toThrow('Unauthorized');
  });
});
