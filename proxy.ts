import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
// import { logActivity } from '@/lib/logging';

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip proxy if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

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

  // Refresh/validate user (also renews cookies on change)
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // Extract roles from user metadata if available (fallback to empty array)
  const roles: string[] = Array.isArray(user?.user_metadata?.roles)
    ? (user!.user_metadata!.roles as string[])
    : typeof user?.user_metadata?.role === 'string'
    ? [user!.user_metadata!.role as string]
    : [];

  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith('/dashboard');

  // Enforce auth for dashboard routes
  if (isDashboard && !user) {
    /*
		await logActivity({
			activity_type: 'auth_redirect',
			event_name: 'Unauthenticated dashboard access',
			page_url: request.nextUrl.toString(),
			additional_data: { reason: 'no_user' },
		});
		*/
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    // Preserve original destination for post-login redirect
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Admin gating example: block /dashboard/admin without 'admin' role
  if (pathname.startsWith('/dashboard/admin') && user && !roles.includes('admin')) {
    /*
		await logActivity({
			activity_type: 'auth_forbidden',
			event_name: 'Forbidden admin access',
			page_url: request.nextUrl.toString(),
			additional_data: { reason: 'missing_admin_role', roles },
		});
		*/
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(url);
  }

  // Optionally attach user id to headers for downstream usage
  if (user) {
    response.headers.set('x-user-id', user.id);
    if (roles.length) {
      response.headers.set('x-user-roles', roles.join(','));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
