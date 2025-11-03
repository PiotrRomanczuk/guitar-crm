import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export async function getUserWithRolesSSR() {
	console.log('[SSR DEBUG] getUserWithRolesSSR called');
	const cookieStore = await cookies();

	console.log('[SSR DEBUG] Cookie store:', cookieStore);
	const supabase = createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch {
						// Server component - cannot set cookies
					}
				},
			},
		}
	);

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	console.log('[SSR DEBUG] Supabase user:', user);
	if (userError) {
		console.log('[SSR DEBUG] Supabase user error:', userError);
	}

	if (!user) {
		return {
			user: null,
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		};
	}

	// Fetch roles from profiles table
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('isAdmin, isTeacher, isStudent')
		.eq('user_id', user.id as string)
		.single();

	console.log('[SSR DEBUG] Supabase profile:', profile);
	if (profileError) {
		console.log('[SSR DEBUG] Supabase profile error:', profileError);
	}

	// Type guard for profile
	type ProfileRoles = {
		isAdmin: boolean;
		isTeacher: boolean;
		isStudent: boolean;
	};

	return {
		user,
		isAdmin: profile
			? (profile as unknown as ProfileRoles).isAdmin ?? false
			: false,
		isTeacher: profile
			? (profile as unknown as ProfileRoles).isTeacher ?? false
			: false,
		isStudent: profile
			? (profile as unknown as ProfileRoles).isStudent ?? false
			: false,
	};
}
