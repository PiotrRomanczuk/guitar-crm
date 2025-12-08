import { render, screen } from '@testing-library/react';
import SongPage from '@/app/dashboard/songs/[id]/page';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { getSongStudents } from '@/app/dashboard/songs/[id]/actions';

// Mock dependencies
jest.mock('@/lib/getUserWithRolesSSR');
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
jest.mock('@/app/dashboard/songs/[id]/actions', () => ({
  getSongStudents: jest.fn(),
}));

// Mock child components
jest.mock('@/components/songs', () => ({
  SongDetail: () => <div data-testid="song-detail">Song Detail</div>,
}));
jest.mock('@/components/songs/SongLessons', () => {
  const MockSongLessons = () => <div data-testid="song-lessons">Song Lessons</div>;
  MockSongLessons.displayName = 'SongLessons';
  return MockSongLessons;
});
jest.mock('@/components/songs/SongAssignments', () => {
  const MockSongAssignments = () => <div data-testid="song-assignments">Song Assignments</div>;
  MockSongAssignments.displayName = 'SongAssignments';
  return MockSongAssignments;
});
jest.mock('@/components/songs/SongStudents', () => ({
  SongStudents: () => <div data-testid="song-students">Song Students</div>,
}));
jest.mock('@/components/shared', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
}));

describe('SongDetailPage', () => {
  const mockParams = Promise.resolve({ id: 'song-123' });
  const mockSearchParams = Promise.resolve({});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if no user', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue({ user: null });

    await SongPage({ params: mockParams, searchParams: mockSearchParams });

    expect(redirect).toHaveBeenCalledWith('/sign-in');
  });

  it('renders song details, lessons, and assignments for authorized user', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
      isAdmin: true,
      isTeacher: false,
    });
    (getSongStudents as jest.Mock).mockResolvedValue([]);

    const jsx = await SongPage({ params: mockParams, searchParams: mockSearchParams });
    render(jsx);

    expect(screen.getByTestId('song-detail')).toBeInTheDocument();
    expect(screen.getByTestId('song-lessons')).toBeInTheDocument();
    expect(screen.getByTestId('song-assignments')).toBeInTheDocument();
    expect(screen.getByTestId('song-students')).toBeInTheDocument();
  });

  it('accepts searchParams without error', async () => {
    (getUserWithRolesSSR as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
      isAdmin: false,
      isTeacher: false,
    });

    const paramsWithQuery = Promise.resolve({ filter: 'active' });
    const jsx = await SongPage({ params: mockParams, searchParams: paramsWithQuery });
    render(jsx);

    expect(screen.getByTestId('song-detail')).toBeInTheDocument();
  });
});
