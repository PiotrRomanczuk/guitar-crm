/**
 * @jest-environment node
 */
 
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/supabase/admin');
jest.mock('@/lib/getUserWithRolesSSR');

describe('Users API - GET endpoint', () => {
  const mockAdminUser = {
    user: { id: 'admin-id', email: 'admin@example.com' },
    isAdmin: true,
    isTeacher: false,
    isStudent: false,
  };

  const mockProfiles = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      full_name: 'John Doe',
      is_admin: false,
      is_teacher: false,
      is_student: true,
      is_shadow: false,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      full_name: 'Jane Smith',
      is_admin: false,
      is_teacher: true,
      is_student: false,
      is_shadow: false,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 'user-3',
      email: 'shadow@example.com',
      full_name: 'Shadow User',
      is_admin: false,
      is_teacher: false,
      is_student: true,
      is_shadow: true,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
  ];

  const mockAuthUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      last_sign_in_at: '2024-01-15T00:00:00Z',
      app_metadata: { providers: ['email'] },
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      last_sign_in_at: null,
      app_metadata: { providers: ['google'] },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getUserWithRolesSSR to return admin
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue(mockAdminUser);
  });

  describe('N+1 Query Optimization', () => {
    it('should fetch auth users in a single batch query instead of N individual queries', async () => {
      // Mock the admin client's listUsers call counter
      const listUsersCalls: unknown[] = [];
      const getUserByIdCalls: unknown[] = [];

      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn((params) => {
              listUsersCalls.push(params);
              return Promise.resolve({
                data: { users: mockAuthUsers },
                error: null,
              });
            }),
            getUserById: jest.fn((id) => {
              getUserByIdCalls.push(id);
              return Promise.resolve({
                data: { user: mockAuthUsers.find((u) => u.id === id) },
                error: null,
              });
            }),
          },
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
          })),
        })),
      };

      (createAdminClient as jest.Mock).mockReturnValue(mockSupabaseAdmin);

      // Mock regular client
      const mockSupabase = {
        from: jest.fn((table) => {
          if (table === 'profiles') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn(() =>
                    Promise.resolve({
                      data: mockProfiles,
                      error: null,
                      count: mockProfiles.length,
                    })
                  ),
                })),
              })),
            };
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({ data: null, error: null })
                ),
              })),
            })),
          };
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const req = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify we got the data
      expect(data.data).toHaveLength(3);

      // CRITICAL: Verify N+1 is fixed
      // Should call listUsers (batch query) and NOT getUserById (individual queries)
      expect(listUsersCalls.length).toBeGreaterThan(0);
      expect(getUserByIdCalls.length).toBe(0);

      console.log('✓ N+1 query pattern fixed: Using batch listUsers() instead of individual getUserById() calls');
    });

    it('should correctly map registration status from batched auth data', async () => {
      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn(() =>
              Promise.resolve({
                data: { users: mockAuthUsers },
                error: null,
              })
            ),
          },
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
          })),
        })),
      };

      (createAdminClient as jest.Mock).mockReturnValue(mockSupabaseAdmin);

      const mockSupabase = {
        from: jest.fn((table) => {
          if (table === 'profiles') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn(() =>
                    Promise.resolve({
                      data: mockProfiles,
                      error: null,
                      count: mockProfiles.length,
                    })
                  ),
                })),
              })),
            };
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({ data: null, error: null })
                ),
              })),
            })),
          };
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const req = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify registration status is correctly mapped
      const user1 = data.data.find((u: { id: string }) => u.id === 'user-1');
      const user2 = data.data.find((u: { id: string }) => u.id === 'user-2');
      const shadowUser = data.data.find((u: { id: string }) => u.id === 'user-3');

      // user-1 has last_sign_in_at, should be registered
      expect(user1.isRegistered).toBe(true);

      // user-2 has OAuth provider (google), should be registered
      expect(user2.isRegistered).toBe(true);

      // shadow user not in auth.users, should be not registered
      expect(shadowUser.isRegistered).toBe(false);
    });

    it('should skip fetching auth data for shadow users', async () => {
      const onlyShadowProfiles = [mockProfiles[2]]; // Only shadow user

      const listUsersCalls: unknown[] = [];

      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn((params) => {
              listUsersCalls.push(params);
              return Promise.resolve({
                data: { users: [] },
                error: null,
              });
            }),
          },
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
          })),
        })),
      };

      (createAdminClient as jest.Mock).mockReturnValue(mockSupabaseAdmin);

      const mockSupabase = {
        from: jest.fn((table) => {
          if (table === 'profiles') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn(() =>
                    Promise.resolve({
                      data: onlyShadowProfiles,
                      error: null,
                      count: onlyShadowProfiles.length,
                    })
                  ),
                })),
              })),
            };
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({ data: null, error: null })
                ),
              })),
            })),
          };
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const req = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(req);

      expect(response.status).toBe(200);

      // Should not call listUsers since all users are shadow users
      expect(listUsersCalls.length).toBe(0);
    });
  });

  describe('Authorization', () => {
    it('should return 401 for unauthorized users', async () => {
      (getUserWithRolesSSR as jest.Mock).mockResolvedValue({
        user: null,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
      });

      const req = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(req);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should allow students to see only their own profile', async () => {
      const studentUser = {
        user: { id: 'student-id', email: 'student@example.com' },
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
      };

      (getUserWithRolesSSR as jest.Mock).mockResolvedValue(studentUser);

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: {
                    id: 'student-id',
                    email: 'student@example.com',
                    full_name: 'Student Name',
                    is_admin: false,
                    is_teacher: false,
                    is_student: true,
                    is_shadow: false,
                    is_active: true,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                  },
                  error: null,
                })
              ),
            })),
          })),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const req = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe('student-id');
    });
  });

  describe('Filtering and Pagination', () => {
    it('should support search query parameter', async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            or: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(() =>
                  Promise.resolve({
                    data: [mockProfiles[0]],
                    error: null,
                    count: 1,
                  })
                ),
              })),
            })),
          })),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn(() =>
              Promise.resolve({
                data: { users: [mockAuthUsers[0]] },
                error: null,
              })
            ),
          },
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
          })),
        })),
      };

      (createAdminClient as jest.Mock).mockReturnValue(mockSupabaseAdmin);

      const req = new NextRequest('http://localhost:3000/api/users?search=John');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should support pagination with limit and offset', async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn((start, end) => {
                expect(start).toBe(10);
                expect(end).toBe(19);
                return Promise.resolve({
                  data: [],
                  error: null,
                  count: 0,
                });
              }),
            })),
          })),
        })),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn(() =>
              Promise.resolve({
                data: { users: [] },
                error: null,
              })
            ),
          },
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
          })),
        })),
      };

      (createAdminClient as jest.Mock).mockReturnValue(mockSupabaseAdmin);

      const req = new NextRequest('http://localhost:3000/api/users?limit=10&offset=10');
      const response = await GET(req);

      expect(response.status).toBe(200);
    });
  });
});

describe('Users API - POST endpoint', () => {
  const mockAdminUser = {
    user: { id: 'admin-id', email: 'admin@example.com' },
    isAdmin: true,
    isTeacher: false,
    isStudent: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue(mockAdminUser);
  });

  it('should create a shadow user when email is empty', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: {
                  id: 'new-shadow-id',
                  email: 'shadow_new-shadow-id@placeholder.com',
                  full_name: 'Shadow Student',
                  is_shadow: true,
                  is_student: true,
                },
                error: null,
              })
            ),
          })),
        })),
      })),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const bodyData = JSON.stringify({
      firstName: 'Shadow',
      lastName: 'Student',
      isStudent: true,
    });

    // Create a proper Request object with text() method
    const req = {
      url: 'http://localhost:3000/api/users',
      method: 'POST',
      text: jest.fn().mockResolvedValue(bodyData),
    } as unknown as Request;

    const response = await POST(req);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.is_shadow).toBe(true);
  });

  it('should return 401 for unauthorized users', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue({
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
    });

    const bodyData = JSON.stringify({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    const req = {
      url: 'http://localhost:3000/api/users',
      method: 'POST',
      text: jest.fn().mockResolvedValue(bodyData),
    } as unknown as Request;

    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it('should return 403 when teacher tries to create admin or teacher', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue({
      user: { id: 'teacher-id', email: 'teacher@example.com' },
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
    });

    const bodyData = JSON.stringify({
      email: 'newadmin@example.com',
      firstName: 'New',
      lastName: 'Admin',
      isAdmin: true,
    });

    const req = {
      url: 'http://localhost:3000/api/users',
      method: 'POST',
      text: jest.fn().mockResolvedValue(bodyData),
    } as unknown as Request;

    const response = await POST(req);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Teachers can only create students');
  });
});
