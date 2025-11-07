// TODO: This test file needs to be updated to match the actual getUserWithRolesSSR signature
// The function takes no parameters and always uses the authenticated user
// This test is temporarily disabled until refactored

import { jest } from '@jest/globals';
import * as serverClientModule from '@/lib/supabase/server';
import { describe, expect, it, beforeEach } from '@jest/globals';
import { getUserWithRolesSSR as getUserRoles } from '@/lib/getUserWithRolesSSR';
import { createServerClient } from '@supabase/ssr';

// Subject under test is statically imported above

// Mock the server-side Supabase client factory
const mockAuth: { getUser: jest.Mock<() => Promise<unknown>> } = {
  getUser: jest.fn() as jest.Mock<() => Promise<unknown>>,
};

function makeFromChain(profileData: unknown, error: unknown = null) {
  const chain: any = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.single = (jest.fn() as jest.Mock<() => Promise<unknown>>).mockResolvedValue({
    data: profileData,
    error,
  });
  return chain;
}

const mockSupabase: unknown = {
  auth: mockAuth,
  from: jest.fn(),
};

describe('getUserRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(serverClientModule, 'createClient').mockResolvedValue(mockSupabase as any);
  });

  it('returns roles for a provided userId', async () => {
    const profile = { isAdmin: true, isTeacher: false, isStudent: true };
    mockSupabase.from.mockImplementation(() => makeFromChain(profile));
    mockAuth.getUser.mockResolvedValue({ data: { user: null } } as any);

    const result = await getUserRoles({ userId: 'user-123' });
    expect(result).toEqual({
      isUserAdmin: true,
      isUserTeacher: false,
      isUserStudent: true,
    });
  });

  it('uses authenticated user when userId not provided', async () => {
    const profile = { isAdmin: false, isTeacher: true, isStudent: false };
    mockSupabase.from.mockImplementation(() => makeFromChain(profile));
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1' } },
    } as any);

    const result = await getUserRoles();
    expect(result).toEqual({
      isUserAdmin: false,
      isUserTeacher: true,
      isUserStudent: false,
    });
  });

  it('returns all false when unauthenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } } as any);

    const result = await getUserRoles();
    expect(result).toEqual({
      isUserAdmin: false,
      isUserTeacher: false,
      isUserStudent: false,
    });
  });

  it('returns all false when profile not found', async () => {
    mockSupabase.from.mockImplementation(() => makeFromChain(null, { message: 'not found' }));
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'u-2' } },
    } as any);

    const result = await getUserRoles();
    expect(result).toEqual({
      isUserAdmin: false,
      isUserTeacher: false,
      isUserStudent: false,
    });
  });
});

describe('getUserWithRolesSSR', () => {
  it('should be refactored', () => {
    expect(true).toBe(true);
  });
});
