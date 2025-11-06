import { createClient } from '@/lib/supabase/server';

export async function getUserWithRolesSSR() {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError) {
		// Optionally log or handle error
		return {
			user: null,
			isAdmin: false,
			isTeacher: false,
			isStudent: false,
		};
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
		.eq('user_id', user.id)
		.single();

	if (profileError) {
		console.error('Profile query error:', profileError);
	}

	if (profile) {
		return {
			user,
			isAdmin: !!profile.isAdmin,
			isTeacher: !!profile.isTeacher,
			isStudent: !!profile.isStudent,
		};
	}

	// Fallback: if user is development admin, set isAdmin true
	if (user.email === 'p.romanczuk@gmail.com') {
		return {
			user,
			isAdmin: true,
			isTeacher: true,
			isStudent: false,
		};
	}

	return {
		user,
		isAdmin: false,
		isTeacher: false,
		isStudent: false,
	};
}
