import React from 'react';
import { render, screen } from '@testing-library/react';
import SongDetail from '@/components/songs/SongDetail';

// Mock browser client provider
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
    render(<SongDetail songId="test-id" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

// Additional minimal tests can be added later to cover found/not-found scenarios.
