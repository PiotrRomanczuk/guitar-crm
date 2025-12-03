import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';

// Mock the server client module
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.Mock;

// Mock auth and database responses
const mockAuth = {
  getUser: jest.fn(),
};

function makeFromChain(profileData: unknown, error: unknown = null) {
  const chain = {
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (chain.single as any).mockResolvedValue({
    data: profileData,
    error,
  });
  return chain;
}

const mockSupabase = {
  auth: mockAuth,
  from: jest.fn(),
};

describe('getUserWithRolesSSR', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  it('returns user with profile roles when authenticated', async () => {
    const profile = { role: 'admin' }; // The implementation checks for roles in user_roles table, not profile flags anymore?
    // Wait, let's check the implementation of getUserWithRolesSSR again.
    
    /*
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
        
      if (roles) {
        return {
          user,
          isAdmin: roles.some((r) => r.role === 'admin'),
          isTeacher: roles.some((r) => r.role === 'teacher'),
          isStudent: roles.some((r) => r.role === 'student'),
        };
      }
    */
    
    // The implementation has changed! It uses `user_roles` table now.
    // The test was setting up `profile` with `is_admin` flags, but the code expects `user_roles` rows.
    
    const mockUser = { id: 'u-1', email: 'test@example.com' };
    const mockRoles = [{ role: 'admin' }, { role: 'student' }];

    // Mock the chain for user_roles table
    const selectMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ data: mockRoles, error: null });
    
    mockSupabase.from.mockReturnValue({
      select: selectMock,
      eq: eqMock
    });
    
    // Fix the chain mock in the test setup
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: mockRoles, error: null })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
      };
    });

    (mockAuth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await getUserWithRolesSSR();
    expect(result).toEqual({
      user: mockUser,
      isAdmin: true,
      isTeacher: false,
      isStudent: true,
    });
  });

  it('returns special admin roles for development admin email', async () => {
    const mockUser = { id: 'admin-id', email: 'p.romanczuk@gmail.com' };

    // Mock error or null data to trigger fallback
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'error' } })
    }));

    (mockAuth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await getUserWithRolesSSR();
    expect(result).toEqual({
      user: mockUser,
      isAdmin: true,
      isTeacher: true,
      isStudent: false,
    });
  });

  it('returns all false when unauthenticated', async () => {
    (mockAuth.getUser as jest.Mock).mockResolvedValue({
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

  it('returns all false when roles not found for regular user', async () => {
    const mockUser = { id: 'u-2', email: 'regular@example.com' };

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null })
    }));

    (mockAuth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
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
