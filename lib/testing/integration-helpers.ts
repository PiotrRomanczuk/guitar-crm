/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared integration test helpers
 *
 * Provides reusable mock factories for API route integration tests:
 * - Chainable Supabase query builder mocks
 * - Auth context mocks per role
 * - NextRequest factory
 */

import { NextRequest } from 'next/server';

/**
 * Create a chainable Supabase query builder mock.
 * All chainable methods return `this`; terminal methods resolve with the provided data.
 */
export function createMockQueryBuilder(
  data: any = [],
  error: any = null,
  count: number | null = null
) {
  const resolvedCount = count ?? (Array.isArray(data) ? data.length : data ? 1 : 0);

  const builder: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error }),
    maybeSingle: jest.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error }),
    then: jest.fn((resolve: (v: any) => void) =>
      resolve({ data, error, count: resolvedCount })
    ),
  };

  // Make every chainable method return the builder itself
  for (const key of Object.keys(builder)) {
    if (!['single', 'maybeSingle', 'then'].includes(key)) {
      builder[key].mockReturnValue(builder);
    }
  }

  return builder;
}

type Role = 'admin' | 'teacher' | 'student';

const MOCK_IDS: Record<Role, string> = {
  admin: '00000000-aaaa-4000-a000-000000000001',
  teacher: '00000000-bbbb-4000-a000-000000000002',
  student: '00000000-cccc-4000-a000-000000000003',
};

const MOCK_EMAILS: Record<Role, string> = {
  admin: 'admin@example.com',
  teacher: 'teacher@example.com',
  student: 'student@example.com',
};

/**
 * Create a mock auth context (user + profile) for a given role.
 */
export function createMockAuthContext(role: Role) {
  const userId = MOCK_IDS[role];
  const email = MOCK_EMAILS[role];

  const user = { id: userId, email };

  const profile = {
    is_admin: role === 'admin',
    is_teacher: role === 'teacher' || role === 'admin',
    is_student: role === 'student',
    id: userId,
    user_id: userId,
  };

  const profileMapped = {
    isAdmin: profile.is_admin,
    isTeacher: profile.is_teacher,
    isStudent: profile.is_student,
  };

  return { user, profile, profileMapped, userId, email };
}

/**
 * Create a mock Supabase client pre-configured for a given role.
 */
export function createMockSupabaseClient(
  role: Role,
  queryBuilder?: ReturnType<typeof createMockQueryBuilder>
) {
  const { user, profile } = createMockAuthContext(role);
  const qb = queryBuilder ?? createMockQueryBuilder();
  const profileBuilder = createMockQueryBuilder(profile);

  const client = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: jest.fn((table: string) => {
      if (table === 'profiles') return profileBuilder;
      return qb;
    }),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return { client, queryBuilder: qb, profileBuilder, user, profile };
}

/**
 * Create a mock unauthenticated Supabase client.
 */
export function createMockUnauthenticatedClient() {
  const qb = createMockQueryBuilder();
  return {
    client: {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
      from: jest.fn().mockReturnValue(qb),
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
    queryBuilder: qb,
  };
}

/**
 * Create a NextRequest for testing API routes.
 */
export function createMockNextRequest(
  url: string,
  options: {
    method?: string;
    body?: Record<string, any>;
    headers?: Record<string, string>;
  } = {}
) {
  const { method = 'GET', body, headers = {} } = options;
  const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
  const init: RequestInit = { method };

  if (body) {
    init.body = JSON.stringify(body);
    headers['content-type'] = 'application/json';
  }

  if (Object.keys(headers).length > 0) {
    init.headers = headers;
  }

  return new NextRequest(fullUrl, init);
}

/**
 * Standard mock IDs for test data.
 */
export const MOCK_DATA_IDS = {
  lesson: '00000000-1111-4000-a000-000000000010',
  song: '00000000-2222-4000-a000-000000000020',
  assignment: '00000000-3333-4000-a000-000000000030',
  ...MOCK_IDS,
} as const;
