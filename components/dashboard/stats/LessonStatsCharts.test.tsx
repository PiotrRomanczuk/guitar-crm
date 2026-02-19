import { render, screen } from '@testing-library/react';
import { LessonStatsCharts } from './LessonStatsCharts';
import { useQuery } from '@tanstack/react-query';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
}));

describe('LessonStatsCharts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<LessonStatsCharts />);
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('renders charts when data is available', () => {
    const mockData = {
      monthly: [
        { month: '2023-01', count: 5 },
        { month: '2023-02', count: 8 },
      ],
      byStatus: {
        scheduled: 10,
        completed: 20,
      },
    };

    (useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    render(<LessonStatsCharts />);

    expect(screen.getByText('Lessons Trend')).toBeInTheDocument();
    expect(screen.getByText('Monthly Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Status Breakdown')).toBeInTheDocument();

    // Check for table headers
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();

    // Check for data in tables
    expect(screen.getByText('scheduled')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        monthly: [],
        byStatus: {},
      },
      isLoading: false,
    });

    render(<LessonStatsCharts />);

    expect(screen.getByText('Lessons Trend')).toBeInTheDocument();
    expect(screen.getByText('Monthly Breakdown')).toBeInTheDocument();
  });
});
