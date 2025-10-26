import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This middleware runs on the Edge runtime
export async function middleware(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	// Skip middleware if Supabase is not configured
	if (!supabaseUrl || !supabaseAnonKey) {
		return NextResponse.next();
	}

	// Create a Supabase client with the request cookies
	const response = NextResponse.next();
	const supabase = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			storage: {
				getItem: async (key: string) => {
					return request.cookies.get(key)?.value ?? null;
				},
				setItem: async (key: string, value: string) => {
					response.cookies.set(key, value);
				},
				removeItem: async (key: string) => {
					response.cookies.delete(key);
				},
			},
		},
	});

	// Get the current session
	const {
		data: { session },
	} = await supabase.auth.getSession();

	const { pathname } = request.nextUrl;

	// Redirect unauthenticated users to sign-in
	if (!session) {
		if (
			pathname.startsWith('/admin') ||
			pathname.startsWith('/teacher') ||
			pathname.startsWith('/student')
		) {
			const signInUrl = new URL('/sign-in', request.url);
			signInUrl.searchParams.set('redirect', pathname);
			return NextResponse.redirect(signInUrl);
		}
		return response;
	}

	// Fetch user profile for role checking
	const { data: profile } = await supabase
		.from('profiles')
		.select('isAdmin,isTeacher,isStudent')
		.eq('user_id', session.user.id)
		.single();

	// Fallback to user metadata if profile not available
	const isAdmin =
		profile?.isAdmin ?? session.user.user_metadata?.isAdmin ?? false;
	const isTeacher =
		profile?.isTeacher ?? session.user.user_metadata?.isTeacher ?? false;
	const isStudent =
		profile?.isStudent ?? session.user.user_metadata?.isStudent ?? false;

	// Protect admin routes
	if (pathname.startsWith('/admin')) {
		if (!isAdmin) {
			return NextResponse.redirect(new URL('/', request.url));
		}
	}

	// Protect teacher routes (admin can also access)
	if (pathname.startsWith('/teacher')) {
		if (!isTeacher && !isAdmin) {
			return NextResponse.redirect(new URL('/', request.url));
		}
	}

	// Protect student routes (admin can also access)
	if (pathname.startsWith('/student')) {
		if (!isStudent && !isAdmin) {
			return NextResponse.redirect(new URL('/', request.url));
		}
	}

	return response;
}

// Configure which routes use this middleware
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - sign-in, sign-up, forgot-password (auth pages)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|sign-in|sign-up|forgot-password).*)',
	],
};
