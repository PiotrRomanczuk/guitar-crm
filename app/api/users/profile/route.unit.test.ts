/**
 * @jest-environment node
 */
import { GET, PUT } from './route';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/getUserWithRolesSSR');

const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: jest.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  }),
}));

const mockGetUser = getUserWithRolesSSR as jest.MockedFunction<typeof getUserWithRolesSSR>;

const mockProfile = {
  id: 'user-1',
  email: 'user@example.com',
  full_name: 'John Doe',
  phone: '123456789',
  avatar_url: null,
  is_admin: false,
  is_teacher: false,
  is_student: true,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('Users Profile API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
    });

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it('returns the authenticated user profile', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' } as never,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
    });

    mockSelect.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }),
    });

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBe('user-1');
    expect(data.full_name).toBe('John Doe');
  });
});

describe('Users Profile API - PUT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
    });

    const request = new Request('http://localhost/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ full_name: 'New Name' }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid body', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' } as never,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
    });

    const request = new Request('http://localhost/api/users/profile', {
      method: 'PUT',
      body: 'not json',
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when no fields provided', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' } as never,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
    });

    const request = new Request('http://localhost/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });

  it('rejects role escalation fields silently', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' } as never,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
    });

    // Attempting to set is_admin should be ignored by Zod (not in schema)
    const request = new Request('http://localhost/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: true }),
    });

    const response = await PUT(request);
    // No valid fields = 400
    expect(response.status).toBe(400);
  });

  it('updates profile with valid fields', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' } as never,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
    });

    const updatedProfile = { ...mockProfile, full_name: 'Jane Updated' };

    mockUpdate.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: updatedProfile, error: null }),
        }),
      }),
    });

    const request = new Request('http://localhost/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Jane Updated' }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.full_name).toBe('Jane Updated');
  });
});
