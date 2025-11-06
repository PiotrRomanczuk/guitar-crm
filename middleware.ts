import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export async function middleware(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	const { pathname } = request.nextUrl;

	console.log('🔧 [MIDDLEWARE] ===== START =====');
	console.log('🔧 [MIDDLEWARE] Path:', pathname);
	console.log('🔧 [MIDDLEWARE] Supabase URL:', supabaseUrl);
	console.log('🔧 [MIDDLEWARE] Has Anon Key:', !!supabaseAnonKey);

	// Skip middleware if Supabase is not configured
	if (!supabaseUrl || !supabaseAnonKey) {
		console.log('🔧 [MIDDLEWARE] Supabase not configured, skipping');
		return NextResponse.next();
	}

	// Get all cookies from request
	const allCookies = request.cookies.getAll();
	console.log('🔧 [MIDDLEWARE] Request cookies count:', allCookies.length);
	console.log(
		'🔧 [MIDDLEWARE] Cookie names:',
		allCookies.map((c) => c.name)
	);

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
	console.log('🔧 [MIDDLEWARE] Calling getSession()...');
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	console.log('🔧 [MIDDLEWARE] Session result:', {
		hasSession: !!session,
		hasError: !!error,
		error: error ? error.message : null,
	});

	if (session) {
		console.log('🔧 [MIDDLEWARE] Session details:', {
			userId: session.user?.id,
			email: session.user?.email,
			expiresAt: session.expires_at,
		});
	} else {
		console.log('🔧 [MIDDLEWARE] No session found');
	}

	console.log('🔧 [MIDDLEWARE] ===== END =====');

	// Skip all middleware auth checks - let client-side components handle protection
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
