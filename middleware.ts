import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { middlewareLogger as log } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  log.info(`${request.method} ${request.nextUrl.pathname}`);
  log.debug('Request cookies', {
    cookies: request.cookies
      .getAll()
      .map((c) => c.name)
      .join(', '),
  });

  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;
  try {
    const config = getSupabaseConfig();
    supabaseUrl = config.url;
    supabaseAnonKey = config.anonKey;
  } catch {
    // Config missing — let the request through without auth checks
  }

  // Skip middleware if Supabase is not configured
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
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        log.debug('cookies.getAll called');
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        log.debug('cookies.setAll called', {
          cookies: cookiesToSet.map((c) => c.name),
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Get the current user - this will not throw errors for missing tokens
  // Use getUser instead of getSession for better security and reliability in middleware
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  log.info('Auth Check', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: userError?.message,
  });

  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith('/dashboard');

  // Enforce auth for dashboard routes
  if (isDashboard && !user) {
    log.info('Redirecting to sign-in (unauthenticated)');
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    // Preserve original destination for post-login redirect
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Check if user account is deactivated and fetch role flags (for dashboard routes only)
  if (isDashboard && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active, is_admin, is_teacher, is_student')
      .eq('id', user.id)
      .single();

    if (profile && profile.is_active === false) {
      log.info('Redirecting to sign-in (account deactivated)', { userId: user.id });
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('error', 'account_deactivated');
      return NextResponse.redirect(url);
    }

    // Admin gating: block /dashboard/admin without admin role from DB
    if (pathname.startsWith('/dashboard/admin') && !profile?.is_admin) {
      log.info('Redirecting to dashboard (forbidden admin access)');
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }

    // Build roles array from DB booleans for downstream usage
    const roles: string[] = [];
    if (profile?.is_admin) roles.push('admin');
    if (profile?.is_teacher) roles.push('teacher');
    if (profile?.is_student) roles.push('student');

    // Attach user id and roles to headers for downstream usage
    response.headers.set('x-user-id', user.id);
    if (roles.length) {
      response.headers.set('x-user-roles', roles.join(','));
    }
  } else if (user) {
    // Non-dashboard route but user is authenticated
    response.headers.set('x-user-id', user.id);
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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
    '/((?!api|_next/static|_next/image|favicon.ico|.*..*|sign-in|sign-up|forgot-password).*)',
  ],
};
