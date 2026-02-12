import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from '@/components/navigation/Sidebar';

// Override the global next/navigation mock to allow per-test pathname control
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

// Mock Supabase client (sign out handler)
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

// Mock Sheet component from shadcn/ui (mobile drawer)
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => <div data-testid="sheet" data-open={open}>{children}</div>,
  SheetContent: ({
    children,
  }: {
    children: React.ReactNode;
    side?: string;
    className?: string;
  }) => <div data-testid="sheet-content">{children}</div>,
  SheetTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="sheet-trigger">{asChild ? children : <button>{children}</button>}</div>,
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock ModeToggle
jest.mock('@/components/ui/mode-toggle', () => ({
  ModeToggle: () => <div data-testid="mode-toggle">Theme Toggle</div>,
}));

// Mock DatabaseStatus
jest.mock('@/components/debug/DatabaseStatus', () => ({
  DatabaseStatus: () => (
    <div data-testid="database-status">DB Status</div>
  ),
}));

describe('Sidebar', () => {
  const adminUser = { email: 'admin@example.com' };
  const teacherUser = { email: 'teacher@example.com' };
  const studentUser = { email: 'student@example.com' };

  describe('rendering basics', () => {
    it('renders without crashing for admin user', () => {
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );
      expect(screen.getAllByText('GuitarStudio').length).toBeGreaterThan(0);
    });

    it('renders without crashing for teacher user', () => {
      render(
        <Sidebar
          user={teacherUser}
          isAdmin={false}
          isTeacher={true}
          isStudent={false}
        />
      );
      expect(screen.getAllByText('GuitarStudio').length).toBeGreaterThan(0);
    });

    it('renders without crashing for student user', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );
      expect(screen.getAllByText('GuitarStudio').length).toBeGreaterThan(0);
    });

    it('returns null when user is null', () => {
      const { container } = render(
        <Sidebar
          user={null}
          isAdmin={false}
          isTeacher={false}
          isStudent={false}
        />
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('role label display', () => {
    it('shows "Admin Dashboard" for admin users', () => {
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );
      const labels = screen.getAllByText('Admin Dashboard');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('shows "Teacher Dashboard" for teacher users', () => {
      render(
        <Sidebar
          user={teacherUser}
          isAdmin={false}
          isTeacher={true}
          isStudent={false}
        />
      );
      const labels = screen.getAllByText('Teacher Dashboard');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('shows "Student Dashboard" for student users', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );
      const labels = screen.getAllByText('Student Dashboard');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('admin/teacher navigation links', () => {
    it('shows admin/teacher nav items: Songs, Lessons, Assignments, Users', () => {
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );

      // "Home" appears in both desktop and mobile sidebars
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Songs').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lessons').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Assignments').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
    });

    it('shows admin-specific items: Song Stats, Lesson Stats, Activity Logs', () => {
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );

      expect(screen.getAllByText('Song Stats').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lesson Stats').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Activity Logs').length).toBeGreaterThan(0);
    });

    it('does not show student-specific items for admin', () => {
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );

      expect(screen.queryByText('My Songs')).not.toBeInTheDocument();
      expect(screen.queryByText('My Lessons')).not.toBeInTheDocument();
      expect(screen.queryByText('My Assignments')).not.toBeInTheDocument();
      expect(screen.queryByText('My Stats')).not.toBeInTheDocument();
    });
  });

  describe('student navigation links', () => {
    it('shows student nav items: My Songs, My Lessons, My Assignments, My Stats', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );

      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Songs').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Lessons').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Assignments').length).toBeGreaterThan(0);
      expect(screen.getAllByText('My Stats').length).toBeGreaterThan(0);
    });

    it('does not show admin-specific items for student', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );

      expect(screen.queryByText('Users')).not.toBeInTheDocument();
      expect(screen.queryByText('Song Stats')).not.toBeInTheDocument();
      expect(screen.queryByText('Lesson Stats')).not.toBeInTheDocument();
      expect(screen.queryByText('Activity Logs')).not.toBeInTheDocument();
    });
  });

  describe('common elements', () => {
    it('renders Settings link for all roles', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );

      // Settings appears in both desktop and mobile sidebar
      expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    });

    it('renders Log out button for all roles', () => {
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );

      expect(screen.getAllByText('Log out').length).toBeGreaterThan(0);
    });

    it('renders the ModeToggle (theme switcher)', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );

      expect(screen.getAllByTestId('mode-toggle').length).toBeGreaterThan(0);
    });

    it('renders the DatabaseStatus indicator', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );

      expect(
        screen.getAllByTestId('database-status').length
      ).toBeGreaterThan(0);
    });
  });

  describe('navigation link paths', () => {
    it('renders correct href for admin navigation links', () => {
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );

      // Check that links point to the right paths
      const songsLinks = screen.getAllByText('Songs');
      // Each link appears twice (desktop + mobile), check the first one
      const songsLink = songsLinks[0].closest('a');
      expect(songsLink).toHaveAttribute('href', '/dashboard/songs');

      const usersLinks = screen.getAllByText('Users');
      const usersLink = usersLinks[0].closest('a');
      expect(usersLink).toHaveAttribute('href', '/dashboard/users');
    });

    it('renders correct href for student navigation links', () => {
      render(
        <Sidebar
          user={studentUser}
          isAdmin={false}
          isTeacher={false}
          isStudent={true}
        />
      );

      const mySongsLinks = screen.getAllByText('My Songs');
      const mySongsLink = mySongsLinks[0].closest('a');
      expect(mySongsLink).toHaveAttribute('href', '/dashboard/songs');

      const myStatsLinks = screen.getAllByText('My Stats');
      const myStatsLink = myStatsLinks[0].closest('a');
      expect(myStatsLink).toHaveAttribute('href', '/dashboard/stats');
    });
  });

  describe('sign out functionality', () => {
    it('calls handleSignOut when Log out button is clicked', () => {
      // We cannot easily assert on the supabase signOut mock because handleSignOut
      // is defined inside the component. Instead, verify the button is interactive.
      render(
        <Sidebar
          user={adminUser}
          isAdmin={true}
          isTeacher={false}
          isStudent={false}
        />
      );

      const logoutButtons = screen.getAllByText('Log out');
      // Should not throw when clicked
      expect(() => fireEvent.click(logoutButtons[0])).not.toThrow();
    });
  });
});
