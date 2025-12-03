import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalendarEventsList } from '@/components/dashboard/calendar/CalendarEventsList';
import { getGoogleEvents, createShadowUser } from '@/app/dashboard/actions';

// Mock dependencies
jest.mock('@/app/dashboard/actions', () => ({
  getGoogleEvents: jest.fn(),
  createShadowUser: jest.fn(),
  syncAllLessonsFromCalendar: jest.fn(),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, title }: any) => (
    <button onClick={onClick} title={title}>
      {children}
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  Calendar: () => <span>CalendarIcon</span>,
  Clock: () => <span>ClockIcon</span>,
  MapPin: () => <span>MapPinIcon</span>,
  ArrowRight: () => <span>ArrowRightIcon</span>,
  UserPlus: () => <span>UserPlusIcon</span>,
  RefreshCw: () => <span>RefreshCwIcon</span>,
}));

jest.mock('@/components/dashboard/calendar/ConnectGoogleButton', () => ({
  ConnectGoogleButton: () => <button>Connect Google</button>,
}));

describe('CalendarEventsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render events with attendees and shadow user button when no limit is provided', async () => {
    (getGoogleEvents as jest.Mock).mockResolvedValue([
      {
        id: 'event-1',
        summary: 'Lesson with Student',
        start: { dateTime: '2023-01-01T10:00:00Z' },
        end: { dateTime: '2023-01-01T11:00:00Z' },
        htmlLink: 'http://google.com/calendar/event',
        attendees: [{ email: 'student@example.com' }],
      },
    ]);

    render(<CalendarEventsList />);

    await waitFor(() => {
      expect(screen.getByText('Lesson with Student')).toBeInTheDocument();
    });

    expect(screen.getByText('student@example.com')).toBeInTheDocument();
    expect(screen.getByTitle('Create Shadow User & Sync')).toBeInTheDocument();
  });

  it('should NOT render attendees when limit is provided', async () => {
    (getGoogleEvents as jest.Mock).mockResolvedValue([
      {
        id: 'event-1',
        summary: 'Lesson with Student',
        start: { dateTime: '2023-01-01T10:00:00Z' },
        end: { dateTime: '2023-01-01T11:00:00Z' },
        htmlLink: 'http://google.com/calendar/event',
        attendees: [{ email: 'student@example.com' }],
      },
    ]);

    render(<CalendarEventsList limit={5} />);

    await waitFor(() => {
      expect(screen.getByText('Lesson with Student')).toBeInTheDocument();
    });

    expect(screen.queryByText('student@example.com')).not.toBeInTheDocument();
  });

  it('should call createShadowUser when shadow user button is clicked', async () => {
    (getGoogleEvents as jest.Mock).mockResolvedValue([
      {
        id: 'event-1',
        summary: 'Lesson with Student',
        start: { dateTime: '2023-01-01T10:00:00Z' },
        end: { dateTime: '2023-01-01T11:00:00Z' },
        htmlLink: 'http://google.com/calendar/event',
        attendees: [{ email: 'student@example.com' }],
      },
    ]);

    (createShadowUser as jest.Mock).mockResolvedValue({ success: true });

    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);
    window.alert = jest.fn();

    render(<CalendarEventsList />);

    await waitFor(() => {
      expect(screen.getByTitle('Create Shadow User & Sync')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Create Shadow User & Sync'));

    await waitFor(() => {
      expect(createShadowUser).toHaveBeenCalledWith('student@example.com');
    });
  });
});
