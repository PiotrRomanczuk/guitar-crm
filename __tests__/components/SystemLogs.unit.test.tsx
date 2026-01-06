import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SystemLogs } from '@/components/logs/SystemLogs';
import { createClient } from '@/lib/supabase/client';
import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('SystemLogs Component', () => {
  const mockUsers = [
    { id: 'user1', full_name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', full_name: 'Jane Doe', email: 'jane@example.com' },
  ];

  const mockAssignmentLogs = [
    {
      id: '1',
      change_type: 'created',
      changed_at: '2026-01-06T10:00:00Z',
      changed_by: 'user1',
      assignment_id: 'assign1',
      changer_profile: [{ full_name: 'John Doe', email: 'john@example.com' }],
      assignment: [{ title: 'Test Assignment' }],
    },
  ];

  const mockLessonLogs = [
    {
      id: '2',
      change_type: 'rescheduled',
      changed_at: '2026-01-06T11:00:00Z',
      changed_by: 'user2',
      lesson_id: 'lesson1',
      changer_profile: [{ full_name: 'Jane Doe', email: 'jane@example.com' }],
      lesson: [{ lesson_teacher_number: 123 }],
    },
  ];

  const mockSongLogs = [
    {
      id: '3',
      previous_status: 'learning',
      new_status: 'learned',
      changed_at: '2026-01-06T12:00:00Z',
      student_id: 'user1',
      song_id: 'song1',
      student_profile: [{ full_name: 'John Doe', email: 'john@example.com' }],
      song: [{ title: 'Test Song', author: 'Test Author' }],
    },
  ];

  const mockUserLogs = [
    {
      id: '4',
      change_type: 'role_changed',
      changed_at: '2026-01-06T13:00:00Z',
      changed_by: 'user2',
      user_id: 'user1',
      changer_profile: [{ full_name: 'Jane Doe', email: 'jane@example.com' }],
      user_profile: [{ full_name: 'John Doe', email: 'john@example.com', role: 'student' }],
    },
  ];

  const createMockSupabase = (assignmentData = mockAssignmentLogs, lessonData = mockLessonLogs, songData = mockSongLogs, userData = mockUserLogs, usersData = mockUsers) => ({
    from: jest.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              data: usersData,
              error: null,
            })),
          })),
        };
      }
      
      const dataMap: Record<string, any> = {
        assignment_history: assignmentData,
        lesson_history: lessonData,
        song_status_history: songData,
        user_history: userData,
      };

      return {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: dataMap[table] || [],
              error: null,
            })),
          })),
        })),
      };
    }),
  });

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(createMockSupabase());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<SystemLogs />);
    expect(screen.getByText('System Activity Logs')).toBeInTheDocument();
  });

  it('should display all tabs', () => {
    render(<SystemLogs />);
    
    expect(screen.getByRole('tab', { name: /all logs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /assignments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /lessons/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /song progress/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument();
  });

  it('should load and display logs', async () => {
    render(<SystemLogs />);

    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });
  });

  it('should allow filtering by search term', async () => {
    render(<SystemLogs />);

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Test Assignment' } });

    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });
  });

  it('should allow filtering by user', async () => {
    render(<SystemLogs />);

    await waitFor(() => {
      expect(screen.getByText('All users')).toBeInTheDocument();
    });

    // Click to open select
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const userOption = screen.getByText('John Doe');
      expect(userOption).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    render(<SystemLogs />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    // Click lessons tab
    const lessonsTab = screen.getByRole('tab', { name: /lessons/i });
    fireEvent.click(lessonsTab);

    await waitFor(() => {
      expect(screen.getByText(/Lesson #123/i)).toBeInTheDocument();
    });
  });

  it('should display different log types with appropriate icons', async () => {
    render(<SystemLogs />);

    await waitFor(() => {
      // Check that different types of logs are displayed
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
      expect(screen.getByText(/Lesson #123/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Song/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument(); // User log
    });
  });

  it('should handle empty state', async () => {
    (createClient as jest.Mock).mockReturnValue(createMockSupabase([], [], [], [], mockUsers));

    render(<SystemLogs />);

    await waitFor(() => {
      expect(screen.getByText(/no logs found/i)).toBeInTheDocument();
    });
  });

  it('should display timestamps', async () => {
    render(<SystemLogs />);

    await waitFor(() => {
      // Check that at least one timestamp is displayed (format may vary)
      const timestamps = screen.getAllByText(/2026|Jan|January/i);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  it('should display change type badges', async () => {
    render(<SystemLogs />);

    await waitFor(() => {
      expect(screen.getByText('created')).toBeInTheDocument();
      expect(screen.getByText('rescheduled')).toBeInTheDocument();
      expect(screen.getByText('learned')).toBeInTheDocument();
      expect(screen.getByText('role changed')).toBeInTheDocument();
    });
  });
});
