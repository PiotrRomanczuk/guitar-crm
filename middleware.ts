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

	// TEMPORARILY DISABLE ALL MIDDLEWARE AUTH - RELY ON CLIENT-SIDE RequireAdmin/RequireTeacher/RequireStudent
	console.log(
		'🔧 MIDDLEWARE COMPLETELY DISABLED - Using client-side auth only'
	);
	console.log('🔧 Path:', pathname);
	console.log('🔧 Session exists in middleware:', !!session);
	if (session) {
		console.log('🔧 User ID in middleware:', session.user?.id);
		console.log('� User email in middleware:', session.user?.email);
	}

	// Skip all middleware auth checks - let client-side components handle protection
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
