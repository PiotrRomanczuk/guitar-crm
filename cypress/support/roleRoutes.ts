// Auto-generated routes map for Cypress journey tests
// Purpose: Centralized list of successful navigation targets per role
// Keep this small and declarative so specs can iterate and assert reachability.
// NOTE: Extend as new features (e.g., lessons) ship.

export type RouteEntry = {
	path: string;
	name: string;
	requiresAuth?: boolean;
	dynamic?: boolean; // path contains dynamic segments (e.g., :id)
	note?: string;
};

export const authRoutes: RouteEntry[] = [
	{ path: '/sign-in', name: 'Sign In' },
	{ path: '/sign-up', name: 'Sign Up' },
	{ path: '/forgot-password', name: 'Forgot Password' },
];

// Shared routes accessible to authenticated users (role checks may apply in UI)
export const sharedRoutes: RouteEntry[] = [
	{ path: '/', name: 'Home' },
	{ path: '/songs', name: 'Songs List', requiresAuth: true },
	{ path: '/songs/new', name: 'Create Song', requiresAuth: true },
	{
		path: '/songs/:id',
		name: 'Song Details',
		requiresAuth: true,
		dynamic: true,
	},
];

// Admin journey: full access to admin area + shared entities
export const adminRoutes: RouteEntry[] = [
	{ path: '/admin', name: 'Admin Dashboard', requiresAuth: true },
	{ path: '/admin/users', name: 'Admin Users', requiresAuth: true },
	// Shared
	...sharedRoutes,
];

// Teacher journey: teacher dashboard + shared entities (create allowed by role policy)
export const teacherRoutes: RouteEntry[] = [
	{ path: '/teacher', name: 'Teacher Dashboard', requiresAuth: true },
	// Shared
	...sharedRoutes,
];

// Student journey: student dashboard + read-only shared entities (no create)
export const studentRoutes: RouteEntry[] = [
	{ path: '/student', name: 'Student Dashboard', requiresAuth: true },
	{ path: '/', name: 'Home' },
	{ path: '/songs', name: 'Songs List', requiresAuth: true },
	{
		path: '/songs/:id',
		name: 'Song Details',
		requiresAuth: true,
		dynamic: true,
	},
];

// Development-only helpers (can be used for diagnostics in E2E if needed)
export const devOnlyRoutes: RouteEntry[] = [
	{ path: '/debug-auth', name: 'Debug Auth' },
];

const routes = {
	authRoutes,
	sharedRoutes,
	adminRoutes,
	teacherRoutes,
	studentRoutes,
	devOnlyRoutes,
};

export default routes;
