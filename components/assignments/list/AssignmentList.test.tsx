import { render, screen, fireEvent } from '@testing-library/react';
import AssignmentList from './index';
import { useAssignmentList } from '../hooks';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('../hooks', () => ({
  useAssignmentList: jest.fn(),
}));

// Mock child components
jest.mock('./Header', () => ({
  Header: ({ canCreate }: any) => <div data-testid="header">{canCreate ? 'Can Create' : 'No Create'}</div>,
}));

jest.mock('./Filters', () => ({
  Filters: ({ onSearchChange, onStatusChange, onReset }: any) => (
    <div data-testid="filters">
      <button onClick={() => onSearchChange('test')}>Search</button>
      <button onClick={() => onStatusChange('active')}>Status</button>
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));

jest.mock('./Table', () => ({
  Table: ({ assignments }: any) => (
    <div data-testid="table">
      {assignments.map((a: any) => (
        <div key={a.id}>{a.title}</div>
      ))}
    </div>
  ),
}));

jest.mock('./Empty', () => ({
  Empty: () => <div data-testid="empty">No assignments</div>,
}));

describe('AssignmentList', () => {
  const mockRouter = { replace: jest.fn() };
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/assignments');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('renders loading state', () => {
    (useAssignmentList as jest.Mock).mockReturnValue({
      assignments: [],
      isLoading: true,
      error: null,
    });

    render(<AssignmentList />);
    // Check for spinner class or structure
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useAssignmentList as jest.Mock).mockReturnValue({
      assignments: [],
      isLoading: false,
      error: 'Failed to fetch',
    });

    render(<AssignmentList />);
    expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useAssignmentList as jest.Mock).mockReturnValue({
      assignments: [],
      isLoading: false,
      error: null,
    });

    render(<AssignmentList />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('renders assignments table', () => {
    (useAssignmentList as jest.Mock).mockReturnValue({
      assignments: [{ id: '1', title: 'Assignment 1' }],
      isLoading: false,
      error: null,
    });

    render(<AssignmentList />);
    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByText('Assignment 1')).toBeInTheDocument();
  });

  it('updates URL on search', () => {
    (useAssignmentList as jest.Mock).mockReturnValue({
      assignments: [],
      isLoading: false,
      error: null,
    });

    render(<AssignmentList />);
    fireEvent.click(screen.getByText('Search'));
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/assignments?search=test');
  });

  it('updates URL on status change', () => {
    (useAssignmentList as jest.Mock).mockReturnValue({
      assignments: [],
      isLoading: false,
      error: null,
    });

    render(<AssignmentList />);
    fireEvent.click(screen.getByText('Status'));
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/assignments?status=active');
  });

  it('resets filters', () => {
    (useAssignmentList as jest.Mock).mockReturnValue({
      assignments: [],
      isLoading: false,
      error: null,
    });

    render(<AssignmentList />);
    fireEvent.click(screen.getByText('Reset'));
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/assignments');
  });
});
