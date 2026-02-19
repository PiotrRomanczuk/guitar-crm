import { render, screen } from '@testing-library/react';
import AssignmentDetailPage from '@/app/dashboard/assignments/[id]/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('@/components/shared/StatusBadge', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  getStatusVariant: jest.fn(),
  formatStatus: (status: string) => status,
}));

describe('AssignmentDetailPage', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('redirects to login if no user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const params = Promise.resolve({ id: '123' });
    const searchParams = Promise.resolve({});

    try {
      await AssignmentDetailPage({ params, searchParams });
    } catch {
      // redirect throws an error in Next.js
    }

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('renders assignment details and related songs', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user1' } } });

    const mockAssignment = {
      id: '123',
      title: 'Test Assignment',
      description: 'Do this',
      status: 'pending',
      due_date: '2023-01-01',
      student_id: 's1',
      student_profile: { id: 's1', full_name: 'Student One' },
      teacher_profile: { id: 't1', full_name: 'Teacher One' },
      lesson: {
        id: 'l1',
        lesson_teacher_number: 5,
        lesson_songs: [{ song: { id: 'song1', title: 'Wonderwall', author: 'Oasis' } }],
      },
    };

    const mockProfile = {
      is_admin: true,
      is_teacher: false,
      is_student: false,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        };
      }
      if (table === 'assignments') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const params = Promise.resolve({ id: '123' });
    const searchParams = Promise.resolve({});

    const jsx = await AssignmentDetailPage({ params, searchParams });
    render(jsx);

    expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.getByText('Teacher One')).toBeInTheDocument();
    expect(screen.getByText('Lesson #5')).toBeInTheDocument();
    expect(screen.getByText('Wonderwall')).toBeInTheDocument();
    expect(screen.getByText('Oasis')).toBeInTheDocument();
  });

  it('accepts searchParams without error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user1' } } });

    const mockAssignment = {
      id: '123',
      title: 'Test Assignment',
      status: 'pending',
      student_id: 's1',
      lesson: { lesson_songs: [] }, // Add minimal lesson structure
    };

    const mockProfile = {
      is_admin: true,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        };
      }
      if (table === 'assignments') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const params = Promise.resolve({ id: '123' });
    const searchParams = Promise.resolve({ tab: 'history' });

    const jsx = await AssignmentDetailPage({ params, searchParams });
    render(jsx);

    expect(screen.getByText('Test Assignment')).toBeInTheDocument();
  });
});
