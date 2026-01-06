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

describe('SongStatusHistory Component', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              {
                id: '1',
                previous_status: 'to_learn',
                new_status: 'learning',
                changed_at: '2026-01-06T10:00:00Z',
                student_profile: [{ full_name: 'Student One', email: 'student@example.com' }],
                song: [{ title: 'Test Song', author: 'Test Author' }],
              },
              {
                id: '2',
                previous_status: 'learning',
                new_status: 'learned',
                changed_at: '2026-01-06T11:00:00Z',
                student_profile: [{ full_name: 'Student One', email: 'student@example.com' }],
                song: [{ title: 'Test Song', author: 'Test Author' }],
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<SongStatusHistory songId="test-song-id" />);
    expect(screen.getByText('Learning Progress')).toBeInTheDocument();
  });

  it('should filter by songId when provided', async () => {
    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      const selectCall = mockSupabase.from().select();
      expect(selectCall.eq).toHaveBeenCalledWith('song_id', 'test-song-id');
    });
  });

  it('should filter by studentId when provided', async () => {
    render(<SongStatusHistory studentId="test-student-id" />);

    await waitFor(() => {
      const selectCall = mockSupabase.from().select();
      expect(selectCall.eq).toHaveBeenCalledWith('student_id', 'test-student-id');
    });
  });

  it('should display status progression', async () => {
    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      expect(screen.getByText('learning')).toBeInTheDocument();
      expect(screen.getByText('learned')).toBeInTheDocument();
    });
  });

  it('should show student information when filtering by song', async () => {
    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      expect(screen.getByText('Student One')).toBeInTheDocument();
    });
  });

  it('should show song information when filtering by student', async () => {
    render(<SongStatusHistory studentId="test-student-id" />);

    await waitFor(() => {
      expect(screen.getByText(/Test Song/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
    });
  });

  it('should handle empty history', async () => {
    const emptyMock = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(emptyMock);

    render(<SongStatusHistory songId="test-song-id" />);

    await waitFor(() => {
      expect(screen.getByText(/no progress history/i)).toBeInTheDocument();
    });
  });

  it('should display custom title when provided', () => {
    render(<SongStatusHistory songId="test-song-id" title="Custom Progress Title" />);
    expect(screen.getByText('Custom Progress Title')).toBeInTheDocument();
  });
});
