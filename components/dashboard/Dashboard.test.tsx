import { render, screen } from '@testing-library/react';
import { DashboardPageContent } from './Dashboard';

// Mock child components
jest.mock('./DashboardHeader', () => ({
  DashboardHeader: ({ email, roleText }: any) => (
    <div data-testid="dashboard-header">
      <span>{email}</span>
      <span>{roleText}</span>
    </div>
  ),
}));

jest.mock('./DashboardStatsGrid', () => ({
  DashboardStatsGrid: () => <div data-testid="dashboard-stats-grid">Stats Grid</div>,
}));

jest.mock('./calendar/CalendarEventsList', () => ({
  CalendarEventsList: () => <div data-testid="calendar-events-list">Calendar Events</div>,
}));

jest.mock('./QuickActionsSection', () => ({
  QuickActionsSection: ({ isAdmin, isTeacher }: any) => (
    <div data-testid="quick-actions">
      {isAdmin && 'Admin Actions'}
      {isTeacher && 'Teacher Actions'}
    </div>
  ),
}));

describe('DashboardPageContent', () => {
  const defaultProps = {
    email: 'test@example.com',
    isAdmin: false,
    isTeacher: false,
    isStudent: false,
  };

  it('renders basic dashboard structure', () => {
    render(<DashboardPageContent {...defaultProps} />);
    
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-stats-grid')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });

  it('displays correct user info in header', () => {
    render(<DashboardPageContent {...defaultProps} />);
    
    const header = screen.getByTestId('dashboard-header');
    expect(header).toHaveTextContent('test@example.com');
    expect(header).toHaveTextContent('User');
  });

  it('displays correct roles in header', () => {
    render(<DashboardPageContent {...defaultProps} isAdmin={true} isTeacher={true} />);
    
    const header = screen.getByTestId('dashboard-header');
    expect(header).toHaveTextContent('Admin, Teacher');
  });

  it('renders calendar events for admin', () => {
    render(<DashboardPageContent {...defaultProps} isAdmin={true} />);
    
    expect(screen.getByTestId('calendar-events-list')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toHaveTextContent('Admin Actions');
  });

  it('does not render calendar events for non-admin', () => {
    render(<DashboardPageContent {...defaultProps} isAdmin={false} />);
    
    expect(screen.queryByTestId('calendar-events-list')).not.toBeInTheDocument();
  });

  it('passes correct props to QuickActionsSection', () => {
    render(<DashboardPageContent {...defaultProps} isTeacher={true} />);
    
    expect(screen.getByTestId('quick-actions')).toHaveTextContent('Teacher Actions');
  });
});
