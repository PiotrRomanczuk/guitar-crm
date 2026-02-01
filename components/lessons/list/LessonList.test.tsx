/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LessonList } from '@/components/lessons';

const defaultProps = {
  initialLessons: [],
  role: 'admin' as const,
};
import useLessonList from '../hooks/useLessonList';
import { useProfiles } from '../hooks/useProfiles';
import { useSearchParams } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard/lessons'),
}));

jest.mock('../hooks/useLessonList');
jest.mock('../hooks/useProfiles');

jest.mock('@/components/lessons', () => ({
  ...jest.requireActual('@/components/lessons'),
}));
jest.mock(
  '@/components/lessons/list/LessonList.Header',
  () =>
    function MockHeader() {
      return <div data-testid="lesson-list-header">Header</div>;
    }
);
jest.mock(
  '@/components/lessons/list/LessonList.Filter',
  () =>
    function MockFilter() {
      return <div data-testid="lesson-list-filter">Filter</div>;
    }
);
jest.mock(
  '@/components/lessons/list/LessonTable',
  () =>
    function MockTable({ role }: { role: string }) {
      return <div data-testid="lesson-table">Table ({role})</div>;
    }
);

describe('LessonList', () => {
  const mockUseSearchParams = useSearchParams as jest.Mock;
  const mockUseLessonList = useLessonList as jest.Mock;
  const mockUseProfiles = useProfiles as jest.Mock;

  beforeEach(() => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
    mockUseLessonList.mockReturnValue({
      lessons: [],
      loading: false,
      error: null,
      filterStatus: 'all',
      setFilterStatus: jest.fn(),
    });
    mockUseProfiles.mockReturnValue({
      students: [],
      isLoading: false,
      error: null,
    });
  });

  it('renders loading state', () => {
    mockUseLessonList.mockReturnValue({
      loading: true,
    });

    render(<LessonList {...defaultProps} />);
    // Check for skeleton elements (we can check for class names or structure)
    // Since we used Skeleton component, we can check if it renders something appropriate
    // But simpler is to check that the main content is NOT there
    expect(screen.queryByTestId('lesson-table')).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseLessonList.mockReturnValue({
      error: 'Failed to fetch',
    });

    render(<LessonList {...defaultProps} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('renders success message when created=true', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('true'),
    });

    render(<LessonList {...defaultProps} />);
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Lesson created successfully!')).toBeInTheDocument();
  });

  it('renders list content', () => {
    render(<LessonList {...defaultProps} />);
    expect(screen.getByTestId('lesson-list-header')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-list-filter')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-table')).toBeInTheDocument();
  });

  it('passes role to LessonTable', () => {
    render(<LessonList {...defaultProps} role="teacher" />);
    expect(screen.getByText('Table (teacher)')).toBeInTheDocument();
  });
});
