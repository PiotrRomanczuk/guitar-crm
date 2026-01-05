/**
 * Role-based access control components
 *
 * These components are currently pass-through wrappers.
 * Authentication and authorization is handled by middleware.ts instead.
 *
 * @see middleware.ts for the main auth logic
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs for Supabase SSR auth
 */

interface RequireRoleProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Base component for authentication requirement
 * Auth is handled by middleware - this is a pass-through wrapper
 */
export function RequireAuth({ children }: RequireRoleProps) {
  return <>{children}</>;
}

/**
 * Requires user to be an admin
 * Auth is handled by middleware - this is a pass-through wrapper
 */
export function RequireAdmin({ children }: RequireRoleProps) {
  return <>{children}</>;
}

/**
 * Requires user to be a teacher or admin
 * Auth is handled by middleware - this is a pass-through wrapper
 */
export function RequireTeacher({ children }: RequireRoleProps) {
  return <>{children}</>;
}

/**
 * Requires user to be a student or admin
 * Auth is handled by middleware - this is a pass-through wrapper
 */
export function RequireStudent({ children }: RequireRoleProps) {
  return <>{children}</>;
}
