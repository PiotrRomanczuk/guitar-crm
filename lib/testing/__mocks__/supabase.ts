// Mock Supabase client for Jest tests
// Provides lightweight mocks for database operations

export const createMockClient = () => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null,
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      order: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    }),
    insert: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    update: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    delete: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  }),
});

export const createClient = jest.fn(createMockClient);

export default {
  createClient,
  createMockClient,
};
