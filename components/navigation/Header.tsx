'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { RoleBasedNav } from './RoleBasedNav';
import { ConnectionStatus } from './ConnectionStatus';
import { ModeToggle } from '@/components/ui/mode-toggle';

function MobileMenu({
  open,
  user,
  loading,
  roles,
  onSignOut,
  onSignIn,
  onSignUp,
  isAdmin,
  isTeacher,
  isStudent,
}: {
  open: boolean;
  user: { email?: string } | null;
  loading: boolean;
  roles: string[];
  onSignOut: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}) {
  if (!open) return null;
  return (
    <div className="md:hidden mt-3 pb-3 border-t border-blue-500 dark:border-blue-700 pt-3">
      {user && (
        <div className="mb-3">
          <RoleBasedNav user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
        </div>
      )}
      <div className="flex sm:hidden flex-col gap-2 pt-3 border-t border-blue-500 dark:border-blue-700">
        <div className="px-2 mb-2 flex items-center justify-between">
          <span className="text-blue-50">Theme</span>
          <ModeToggle />
        </div>
        {loading ? (
          <div className="text-blue-100">Loading...</div>
        ) : user ? (
          <>
            <div className="flex flex-col py-2 px-2">
              <div className="text-sm font-medium text-blue-50 break-all">{user.email}</div>
              <RoleDisplay roles={roles} />
            </div>
            <button
              onClick={onSignOut}
              className="w-full text-left bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onSignIn}
              className="text-left text-blue-50 hover:text-white font-medium transition-colors duration-200 px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={onSignUp}
              className="w-full text-left bg-white hover:bg-blue-50 text-blue-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function RoleDisplay({ roles }: { roles: string[] }) {
  if (roles.length === 0) return null;
  return (
    <div className="flex gap-1 mt-1 flex-wrap">
      {roles.map((role) => (
        <span
          key={role}
          className="text-xs px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-medium"
        >
          {role}
        </span>
      ))}
    </div>
  );
}

function DesktopAuthControls({
  user,
  loading,
  roles,
  onSignOut,
  onSignIn,
  onSignUp,
}: {
  user: { email?: string } | null;
  loading: boolean;
  roles: string[];
  onSignOut: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}) {
  return (
    <div className="hidden sm:flex items-center gap-2 sm:gap-3 lg:gap-4">
      <ModeToggle />
      {loading ? (
        <div className="text-blue-100 text-sm">Loading...</div>
      ) : user ? (
        <>
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-xs sm:text-sm font-medium text-blue-50 truncate">{user.email}</div>
            <RoleDisplay roles={roles} />
          </div>
          <button
            onClick={onSignOut}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onSignIn}
            className="text-blue-50 hover:text-white font-medium transition-colors duration-200 text-sm whitespace-nowrap"
          >
            Sign In
          </button>
          <button
            onClick={onSignUp}
            className="bg-white hover:bg-blue-50 text-blue-600 font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}

function MobileMenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden ml-4 p-2 text-white hover:bg-blue-500 dark:hover:bg-blue-700 rounded-lg transition-colors duration-200"
      aria-label="Toggle menu"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {open ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}

async function signOutAndRedirect(
  router: ReturnType<typeof useRouter>,
  setMobileMenuOpen: (v: boolean) => void
) {
  const supabase = createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // TODO: Optionally show error to user
  }
  router.push('/sign-in');
  setMobileMenuOpen(false);
}

export default function Header({
  user: initialUser,
  isAdmin: initialIsAdmin,
  isTeacher: initialIsTeacher,
  isStudent: initialIsStudent,
}: {
  user: { id?: string; email?: string } | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isTeacher, setIsTeacher] = useState(initialIsTeacher);
  const [isStudent, setIsStudent] = useState(initialIsStudent);

  // Poll for auth state changes when user logs in
  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        // User signed in or session updated, refresh their roles
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });

          // Fetch updated roles
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

          if (roles) {
            setIsAdmin(roles.some((r) => r.role === 'admin'));
            setIsTeacher(roles.some((r) => r.role === 'teacher'));
            setIsStudent(roles.some((r) => r.role === 'student'));
          }

          // Refresh the page to get updated server state
          router.refresh();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setIsTeacher(false);
        setIsStudent(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleSignOut = () => signOutAndRedirect(router, setMobileMenuOpen);
  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const roles = [];
  if (isAdmin) roles.push('Admin');
  if (isTeacher) roles.push('Teacher');
  if (isStudent) roles.push('Student');

  return (
    <header className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 shadow-lg border-b border-blue-500 dark:border-blue-700">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Logo */}
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2 text-xl sm:text-2xl md:text-2xl font-bold text-white hover:text-blue-100 transition-colors duration-200 truncate"
              style={{ minWidth: 0 }}
            >
              <span className="text-2xl sm:text-3xl">🎸</span>
              <span className="hidden sm:inline">Guitar CRM</span>
              <span className="sm:hidden">CRM</span>
            </button>

            <ConnectionStatus />

            {/* Mobile Menu Button (only on mobile) */}
            <MobileMenuButton
              open={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-end w-full md:w-auto gap-3 md:gap-0">
            {/* Navigation - Desktop only */}
            {user && (
              <div className="hidden md:flex items-center mx-0 lg:mx-6">
                <RoleBasedNav
                  user={user}
                  isAdmin={isAdmin}
                  isTeacher={isTeacher}
                  isStudent={isStudent}
                />
              </div>
            )}

            {/* Desktop Auth Controls */}
            <DesktopAuthControls
              user={user}
              loading={false}
              roles={roles}
              onSignOut={handleSignOut}
              onSignIn={() => handleNavigation('/sign-in')}
              onSignUp={() => handleNavigation('/sign-up')}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          open={mobileMenuOpen}
          user={user}
          loading={false}
          roles={roles}
          onSignOut={handleSignOut}
          onSignIn={() => handleNavigation('/sign-in')}
          onSignUp={() => handleNavigation('/sign-up')}
          isAdmin={isAdmin}
          isTeacher={isTeacher}
          isStudent={isStudent}
        />
      </div>
    </header>
  );
}
