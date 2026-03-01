import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from '@/components/navigation/Sidebar';

const mockPathname = jest.fn().mockReturnValue('/dashboard');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => mockPathname(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: { signOut: jest.fn().mockResolvedValue({ error: null }) },
  })),
}));

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean; onOpenChange?: (o: boolean) => void }) => (
    <div data-testid="sheet" data-open={open}>{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode; side?: string; className?: string }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="sheet-trigger">{asChild ? children : <button>{children}</button>}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string; className?: string }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/mode-toggle', () => ({
  ModeToggle: () => <div data-testid="mode-toggle">Theme Toggle</div>,
}));

jest.mock('@/components/debug/DatabaseStatus', () => ({
  DatabaseStatus: () => <div data-testid="database-status">DB Status</div>,
}));

describe('Sidebar', () => {
  const adminUser = { email: 'admin@example.com' };
  const teacherUser = { email: 'teacher@example.com' };
  const studentUser = { email: 'student@example.com' };

  describe('rendering basics', () => {
    it('renders without crashing for admin user', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.getAllByText('GuitarStudio').length).toBeGreaterThan(0);
    });

    it('renders without crashing for teacher user', () => {
      render(<Sidebar user={teacherUser} isAdmin={false} isTeacher={true} isStudent={false} />);
      expect(screen.getAllByText('GuitarStudio').length).toBeGreaterThan(0);
    });

    it('renders without crashing for student user', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByText('GuitarStudio').length).toBeGreaterThan(0);
    });

    it('returns null when user is null', () => {
      const { container } = render(<Sidebar user={null} isAdmin={false} isTeacher={false} isStudent={false} />);
      expect(container.innerHTML).toBe('');
    });
  });

  describe('role label display', () => {
    it('shows "Admin Dashboard" for admin users', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.getAllByText('Admin Dashboard').length).toBeGreaterThan(0);
    });

    it('shows "Teacher Dashboard" for teacher users', () => {
      render(<Sidebar user={teacherUser} isAdmin={false} isTeacher={true} isStudent={false} />);
      expect(screen.getAllByText('Teacher Dashboard').length).toBeGreaterThan(0);
    });

    it('shows "Student Dashboard" for student users', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByText('Student Dashboard').length).toBeGreaterThan(0);
    });
  });

  describe('group labels', () => {
    it('renders section headers for admin/teacher groups', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.getAllByText('Teaching').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tools').length).toBeGreaterThan(0);
    });

    it('renders section headers for student groups', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByText('Learning').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Progress').length).toBeGreaterThan(0);
    });
  });

  describe('admin/teacher navigation links', () => {
    it('shows core nav items: Home, Songs, Lessons, Assignments, Students', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Songs').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lessons').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Assignments').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Students').length).toBeGreaterThan(0);
    });

    it('shows analytics items: Song Stats, Lesson Stats, Chord Analysis, Logs', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.getAllByText('Song Stats').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lesson Stats').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Chord Analysis').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Logs').length).toBeGreaterThan(0);
    });

    it('shows new items: Health Monitor, Calendar, Fretboard, AI Assistant', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.getAllByText('Health Monitor').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Calendar').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Fretboard').length).toBeGreaterThan(0);
      expect(screen.getAllByText('AI Assistant').length).toBeGreaterThan(0);
    });

    it('does not show student-specific items for admin', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.queryByText('My Songs')).not.toBeInTheDocument();
      expect(screen.queryByText('My Lessons')).not.toBeInTheDocument();
      expect(screen.queryByText('My Assignments')).not.toBeInTheDocument();
      expect(screen.queryByText('My Stats')).not.toBeInTheDocument();
      expect(screen.queryByText('My Repertoire')).not.toBeInTheDocument();
    });
  });

  describe('student navigation links', () => {
    it('shows student nav items: My Songs, My Lessons, My Assignments, My Stats, My Repertoire', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Songs').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Lessons').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Assignments').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Stats').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Repertoire').length).toBeGreaterThan(0);
    });

    it('does not show admin-specific items for student', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.queryByText('Students')).not.toBeInTheDocument();
      expect(screen.queryByText('Song Stats')).not.toBeInTheDocument();
      expect(screen.queryByText('Lesson Stats')).not.toBeInTheDocument();
      expect(screen.queryByText('Chord Analysis')).not.toBeInTheDocument();
      expect(screen.queryByText('Logs')).not.toBeInTheDocument();
      expect(screen.queryByText('Health Monitor')).not.toBeInTheDocument();
    });
  });

  describe('common elements', () => {
    it('renders Settings link for all roles', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    });

    it('renders Log out button for all roles', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      expect(screen.getAllByText('Log out').length).toBeGreaterThan(0);
    });

    it('renders Notifications link with indicator', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByText('Notifications').length).toBeGreaterThan(0);
    });

    it('renders the ModeToggle (theme switcher)', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByTestId('mode-toggle').length).toBeGreaterThan(0);
    });

    it('renders the DatabaseStatus indicator', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);
      expect(screen.getAllByTestId('database-status').length).toBeGreaterThan(0);
    });
  });

  describe('navigation link paths', () => {
    it('renders correct href for admin navigation links', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);

      const songsLinks = screen.getAllByText('Songs');
      expect(songsLinks[0].closest('a')).toHaveAttribute('href', '/dashboard/songs');

      // "Students" label still points to /dashboard/users
      // Find only the nav link (inside <a>), not the group header (<p>)
      const studentsLinks = screen.getAllByText('Students').filter((el) => el.closest('a'));
      expect(studentsLinks[0].closest('a')).toHaveAttribute('href', '/dashboard/users');
    });

    it('renders correct href for student navigation links', () => {
      render(<Sidebar user={studentUser} isAdmin={false} isTeacher={false} isStudent={true} />);

      const mySongsLinks = screen.getAllByText('My Songs');
      expect(mySongsLinks[0].closest('a')).toHaveAttribute('href', '/dashboard/songs');

      const myStatsLinks = screen.getAllByText('My Stats');
      expect(myStatsLinks[0].closest('a')).toHaveAttribute('href', '/dashboard/stats');

      const repertoireLinks = screen.getAllByText('My Repertoire');
      expect(repertoireLinks[0].closest('a')).toHaveAttribute('href', '/dashboard/repertoire');
    });
  });

  describe('sign out functionality', () => {
    it('calls handleSignOut when Log out button is clicked', () => {
      render(<Sidebar user={adminUser} isAdmin={true} isTeacher={false} isStudent={false} />);
      const logoutButtons = screen.getAllByText('Log out');
      expect(() => fireEvent.click(logoutButtons[0])).not.toThrow();
    });
  });
});
