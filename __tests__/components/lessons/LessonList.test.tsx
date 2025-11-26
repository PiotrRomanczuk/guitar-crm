import React from 'react';
import { render, screen } from '@testing-library/react';
import LessonList from '@/components/lessons/LessonList';
import useLessonList from '@/components/lessons/useLessonList';
import { useSearchParams } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/components/lessons/useLessonList');
jest.mock('@/components/lessons/LessonList.Header', () => () => (
  <div data-testid="lesson-list-header">Header</div>
));
jest.mock('@/components/lessons/LessonList.Filter', () => () => (
  <div data-testid="lesson-list-filter">Filter</div>
));
jest.mock('@/components/lessons/LessonTable', () => ({ role }: { role: string }) => (
  <div data-testid="lesson-table">Table ({role})</div>
));

describe('LessonList', () => {
  const mockUseSearchParams = useSearchParams as jest.Mock;
  const mockUseLessonList = useLessonList as jest.Mock;

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
  });

  it('renders loading state', () => {
    mockUseLessonList.mockReturnValue({
      loading: true,
    });

    render(<LessonList />);
    // Check for skeleton elements (we can check for class names or structure)
    // Since we used Skeleton component, we can check if it renders something appropriate
    // But simpler is to check that the main content is NOT there
    expect(screen.queryByTestId('lesson-table')).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseLessonList.mockReturnValue({
      error: 'Failed to fetch',
    });

    render(<LessonList />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('renders success message when created=true', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('true'),
    });

    render(<LessonList />);
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Lesson created successfully!')).toBeInTheDocument();
  });

  it('renders list content', () => {
    render(<LessonList />);
    expect(screen.getByTestId('lesson-list-header')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-list-filter')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-table')).toBeInTheDocument();
  });

  it('passes role to LessonTable', () => {
    render(<LessonList role="teacher" />);
    expect(screen.getByText('Table (teacher)')).toBeInTheDocument();
  });
});
