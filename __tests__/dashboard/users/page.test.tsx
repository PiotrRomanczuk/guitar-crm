import { render, screen } from '@testing-library/react';
import UserDetailPage from '@/app/dashboard/users/[id]/page';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/getUserWithRolesSSR');
jest.mock('@/lib/supabase/server');
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock child components
jest.mock('@/components/users/UserDetail', () => ({
  __esModule: true,
  default: () => <div data-testid="user-detail">User Detail</div>,
}));
jest.mock('@/components/users/UserLessons', () => ({
  __esModule: true,
  default: () => <div data-testid="user-lessons">User Lessons</div>,
}));
jest.mock('@/components/users/UserAssignments', () => ({
  __esModule: true,
  default: () => <div data-testid="user-assignments">User Assignments</div>,
}));
jest.mock('@/components/users/UserSongs', () => ({
  __esModule: true,
  default: () => <div data-testid="user-songs">User Songs</div>,
}));
jest.mock('@/components/shared', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
}));

describe('UserDetailPage', () => {
  const mockParams = Promise.resolve({ id: 'user-123' });
  const mockSearchParams = Promise.resolve({});

  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    // Make notFound throw to simulate Next.js behavior
    (notFound as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
  });

  it('calls notFound if no current user', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue(null);

    await expect(
      UserDetailPage({ params: mockParams, searchParams: mockSearchParams })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });

  it('renders user details and related sections', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue({ user: { id: 'admin-1' } });

    // Mock Supabase chains
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();
    const mockOr = jest.fn();
    const mockOrder = jest.fn();
    const mockIn = jest.fn();

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    });

    // Default chain behavior
    mockSelect.mockReturnValue({
      eq: mockEq,
      or: mockOr,
      in: mockIn,
      order: mockOrder,
      single: mockSingle,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
      order: mockOrder,
    });
    mockOr.mockReturnValue({
      order: mockOrder,
    });
    mockIn.mockReturnValue({
      // for lesson_songs and songs
    });
    
    // Fix for chained .order() calls
    const mockChain = {
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
    };
    mockOrder.mockReturnValue(mockChain);

    // Specific responses
    // 1. Profile
    mockSingle.mockResolvedValue({
      data: { id: 'user-123', full_name: 'Test User', email: 'test@example.com' },
      error: null,
    });

    // 2. Lessons
    mockOrder.mockResolvedValueOnce({ data: [], error: null }); // Lessons

    // 3. Assignments
    mockOrder.mockResolvedValueOnce({ data: [], error: null }); // Assignments

    // 4. Lesson Songs (if lessons exist, but here empty)
    // If lessons empty, it won't call lesson_songs

    const jsx = await UserDetailPage({ params: mockParams, searchParams: mockSearchParams });
    render(jsx);

    expect(screen.getByTestId('user-detail')).toBeInTheDocument();
    // Note: The page renders UserLessons, UserAssignments, UserSongs components
    // I need to check if they are in the document.
    // Based on the code, they are rendered.
    expect(screen.getByTestId('user-lessons')).toBeInTheDocument();
    expect(screen.getByTestId('user-assignments')).toBeInTheDocument();
    expect(screen.getByTestId('user-songs')).toBeInTheDocument();
  });

  it('accepts searchParams without error', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue({ user: { id: 'admin-1' } });

    // Setup robust recursive mock
    const mockBuilder: any = {
      then: (resolve: any) => resolve({ data: [] }), // Default await response
    };
    
    mockBuilder.select = jest.fn().mockReturnValue(mockBuilder);
    mockBuilder.eq = jest.fn().mockReturnValue(mockBuilder);
    mockBuilder.or = jest.fn().mockReturnValue(mockBuilder);
    mockBuilder.order = jest.fn().mockReturnValue(mockBuilder);
    mockBuilder.single = jest.fn().mockResolvedValue({ data: { id: 'user-123' } });
    mockBuilder.in = jest.fn().mockReturnValue(mockBuilder);

    mockSupabase.from.mockReturnValue(mockBuilder);

    const paramsWithQuery = Promise.resolve({ filter: 'active' });
    const jsx = await UserDetailPage({ params: mockParams, searchParams: paramsWithQuery });
    render(jsx);

    expect(screen.getByTestId('user-detail')).toBeInTheDocument();
  });
});
