import React from 'react';
import { screen } from '@testing-library/react';
import SongDetail from '@/components/songs/SongDetail';
import { renderWithClient } from '@/lib/testing/query-client-test-utils';

// Mock browser client provider - never resolve to simulate loading
jest.mock('@/lib/supabase-browser', () => ({
  getSupabaseBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            new Promise(() => {
              // never resolve to simulate loading
            }),
        }),
      }),
    }),
  }),
}));

// Mock AuthProvider
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    isTeacher: true,
    isAdmin: false,
    isStudent: false,
    loading: false,
  }),
}));

describe('SongDetail Component - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    renderWithClient(<SongDetail songId="test-id" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

// Additional minimal tests can be added later to cover found/not-found scenarios.
