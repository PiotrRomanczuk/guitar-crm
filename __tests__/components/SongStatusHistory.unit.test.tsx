import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SongStatusHistory } from '@/components/shared/SongStatusHistory';
import { createClient } from '@/lib/supabase/client';
import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock ScrollArea component
jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock date-fns to avoid timezone issues
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'Jan 6, 2026'),
}));

describe('SongStatusHistory Component', () => {
  // Create a proper chainable mock that returns promises
  // The query chain is: from().select().order().eq() - each returns a thenable
  const createMockQuery = (data: unknown[] = [], error: unknown = null) => {
    const mockResult = { data, error };
    const createThenable = (): Record<string, unknown> => {
      const thenable: Record<string, unknown> = {
        select: jest.fn(() => createThenable()),
        order: jest.fn(() => createThenable()),
        eq: jest.fn(() => createThenable()),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(mockResult).then(resolve),
        catch: (reject: (reason: unknown) => unknown) => Promise.resolve(mockResult).catch(reject),
      };
      return thenable;
    };
    return createThenable();
  };

  const mockHistoryData = [
    {
      id: '1',
      previous_status: 'to_learn',
      new_status: 'learning',
      changed_at: '2026-01-06T10:00:00Z',
      student: { full_name: 'Student One', email: 'student@example.com' },
      song: { title: 'Test Song', author: 'Test Author' },
    },
    {
      id: '2',
      previous_status: 'learning',
      new_status: 'learned',
      changed_at: '2026-01-06T11:00:00Z',
      student: { full_name: 'Student One', email: 'student@example.com' },
      song: { title: 'Test Song', author: 'Test Author' },
    },
  ];

  const createMockSupabase = (data: unknown[] = mockHistoryData) => {
    const mockQuery = createMockQuery(data);
    return {
      from: jest.fn(() => mockQuery),
    };
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(createMockSupabase());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', async () => {
    render(<SongStatusHistory songId="test-song-id" />);
    // Default title is "Song Status History"
    await waitFor(() => {
      expect(screen.getByText('Song Status History')).toBeInTheDocument();
    });
  });

  it('should display status badges', async () => {
    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      // The component shows status labels like "Learning", "Learned"
      // Multiple badges with same text, use getAllByText
      const learningBadges = screen.getAllByText('Learning');
      expect(learningBadges.length).toBeGreaterThan(0);
    });
  });

  it('should show student information when filtering by song', async () => {
    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      // When filtering by songId, component shows student info (not song info)
      // Use getAllByText since there are 2 history records with same student
      const studentElements = screen.getAllByText('Student One');
      expect(studentElements.length).toBeGreaterThan(0);
    });
  });

  it('should show song information when filtering by student', async () => {
    // When filtering by studentId, component should show song info (not student info)
    // The condition is !songId && record.song
    render(<SongStatusHistory studentId="test-student-id" />);

    await waitFor(() => {
      // Song info should be displayed as "Title - Author" in the component
      // There are 2 history records so there may be multiple matches
      const songElements = screen.getAllByText(/Test Song/);
      expect(songElements.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty history', async () => {
    (createClient as jest.Mock).mockReturnValue(createMockSupabase([]));

    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      // Component shows "No status changes recorded" for empty state
      expect(screen.getByText('No status changes recorded')).toBeInTheDocument();
    });
  });

  it('should display custom title when provided', async () => {
    render(<SongStatusHistory songId="test-song-id" title="Custom Progress Title" />);
    await waitFor(() => {
      expect(screen.getByText('Custom Progress Title')).toBeInTheDocument();
    });
  });

  it('should call Supabase from with correct table', async () => {
    const mockSupabase = createMockSupabase();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('song_status_history');
    });
  });
});
