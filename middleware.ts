import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	// Skip middleware if Supabase is not configured
	if (!supabaseUrl || !supabaseAnonKey) {
		return NextResponse.next();
	}

	// Create response we'll modify
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	// Create Supabase client for Edge runtime using @supabase/ssr
	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(
				cookiesToSet: Array<{
					name: string;
					value: string;
					options?: Record<string, unknown>;
				}>
			) {
				cookiesToSet.forEach(({ name, value }) =>
					request.cookies.set(name, value)
				);
				response = NextResponse.next({
					request,
				});
				cookiesToSet.forEach(({ name, value, options }) =>
					response.cookies.set(name, value, options)
				);
			},
		},
	});

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
