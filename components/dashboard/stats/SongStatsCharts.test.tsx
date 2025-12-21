
import { render, screen } from '@testing-library/react';
import { SongStatsCharts } from './SongStatsCharts';
import { useQuery } from '@tanstack/react-query';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

// Mock Recharts to avoid rendering issues in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}));

describe('SongStatsCharts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<SongStatsCharts />);
    // Loader2 is used, which usually renders an SVG. We can check for the container or class if needed,
    // but checking that charts are NOT present is also good.
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('renders charts when data is available', () => {
    const mockData = {
      levelStats: {
        beginner: 10,
        intermediate: 5,
      },
      keyStats: {
        C: 8,
        G: 7,
      },
      topAuthorsList: [
        { author: 'Beatles', count: 10 },
        { author: 'Eagles', count: 5 },
      ],
    };

    (useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    render(<SongStatsCharts />);

    expect(screen.getByText('Songs by Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Top Authors')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        levelStats: {},
        keyStats: {},
        topAuthorsList: [],
      },
      isLoading: false,
    });

    render(<SongStatsCharts />);

    expect(screen.getByText('Songs by Difficulty')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
