import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export async function proxy(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	// ...existing code...

	// Skip middleware if Supabase is not configured
	if (!supabaseUrl || !supabaseAnonKey) {
		return NextResponse.next();
	}

	// ...existing code...

	// Create a response that we can mutate
	const response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	// Create a Supabase client using @supabase/ssr for proper cookie handling
	const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					request.cookies.set(name, value);
					response.cookies.set(name, value, options);
				});
			},
		},
	});

	// Get the current session
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Protect /dashboard and /admin routes
	if (
		request.nextUrl.pathname.startsWith('/dashboard') ||
		request.nextUrl.pathname.startsWith('/admin')
	) {
		if (!session) {
			const redirectUrl = request.nextUrl.clone();
			redirectUrl.pathname = '/login';
			redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
			return NextResponse.redirect(redirectUrl);
		}
	}
	// Refresh session if expired - this also handles cookie renewal
	await supabase.auth.getUser();

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
