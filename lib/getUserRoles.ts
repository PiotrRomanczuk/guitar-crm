/**
 * Server utility to fetch current user's role flags from the profiles table.
 *
 * Contract:
 * - Input: optional userId to target a specific profile; if omitted, uses the authenticated user from cookies.
 * - Output: { isUserAdmin, isUserTeacher, isUserStudent } booleans. Defaults to false when unauthenticated or profile missing.
 * - Errors: never throws on missing auth/profile; logs and returns all false. Only throws on irrecoverable Supabase client setup issues.
 */
'use server';

import { createClient } from '@/utils/supabase/clients/server';
import type { Profile } from '@/lib/supabase';

export type UserRolesResult = {
	isUserAdmin: boolean;
	isUserTeacher: boolean;
	isUserStudent: boolean;
};

async function resolveUserId(
	supabase: Awaited<ReturnType<typeof createClient>>,
	provided?: string
): Promise<string | null> {
	if (provided) return provided;
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user?.id ?? null;
}

/**
 * Fetch role flags for the current (or specified) user from Supabase profiles.
 */
export async function getUserRoles(params?: {
	userId?: string;
}): Promise<UserRolesResult> {
	try {
		const supabase = await createClient();
		const defaults: UserRolesResult = {
			isUserAdmin: false,
			isUserTeacher: false,
			isUserStudent: false,
		};
		const targetUserId = await resolveUserId(supabase, params?.userId);
		if (!targetUserId) return defaults;

		const { data: profile, error } = await supabase
			.from('profiles')
			.select('isAdmin, isTeacher, isStudent')
			.eq('user_id', targetUserId)
			.single();

		if (error || !profile) return defaults;

		const p = profile as Partial<Profile> | null;
		return {
			isUserAdmin: !!p?.isAdmin,
			isUserTeacher: !!p?.isTeacher,
			isUserStudent: !!p?.isStudent,
		};
	} catch {
		// On unexpected failures (e.g., missing envs for server client), keep safe defaults
		return { isUserAdmin: false, isUserTeacher: false, isUserStudent: false };
	}
}

export default getUserRoles;
