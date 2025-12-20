import { render, screen } from '@testing-library/react';
import { DashboardStatsGrid } from './DashboardStatsGrid';
import { useDashboardStats } from '@/hooks/useDashboardStats';

// Mock dependencies
jest.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: jest.fn(),
}));

jest.mock('./StatsCard', () => ({
  StatsCard: ({ title, value, description }: { title: string; value: string | number; description: string }) => (
    <div data-testid="stats-card">
      <h3>{title}</h3>
      <p>{value}</p>
      <span>{description}</span>
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className} data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

describe('DashboardStatsGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons when loading', () => {
    (useDashboardStats as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<DashboardStatsGrid />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  it('renders error state', () => {
    (useDashboardStats as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<DashboardStatsGrid />);
    expect(screen.getByText('Error loading statistics')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('renders admin stats', () => {
    (useDashboardStats as jest.Mock).mockReturnValue({
      data: {
        role: 'admin',
        stats: {
          totalUsers: 100,
          totalTeachers: 5,
          totalStudents: 95,
          totalSongs: 50,
        },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardStatsGrid />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders teacher stats', () => {
    (useDashboardStats as jest.Mock).mockReturnValue({
      data: {
        role: 'teacher',
        stats: {
          myStudents: 20,
          activeLessons: 10,
          songsLibrary: 30,
          studentProgress: 75,
        },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardStatsGrid />);
    
    expect(screen.getByText('My Students')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Avg Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders student stats', () => {
    (useDashboardStats as jest.Mock).mockReturnValue({
      data: {
        role: 'student',
        stats: {
          myTeacher: 1,
          lessonsDone: 5,
          songsLearning: 3,
          progress: 40,
        },
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardStatsGrid />);
    
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});
