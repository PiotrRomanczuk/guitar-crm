import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent';
import { LandingPage } from '@/components/landingPage/LandingPage';
import { getUserRoles } from '@/lib/getUserRoles';
import { createSupabaseClient } from '@/lib/supabase';

export default async function Home() {
	// Server-side auth: use Supabase server client with cookie-based session
	const supabase = await createSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	console.log('[Home Page] Authenticated user:', {
		hasUser: !!user,
		userId: user?.id,
		email: user?.email,
	});

	// If not authenticated, show the marketing/landing page
	if (!user) {
		return <LandingPage />;
	}

	// Resolve roles from the server utility (SSR safe)
	const roles = await getUserRoles();

	return (
		<DashboardPageContent
			email={user.email}
			isAdmin={roles.isUserAdmin}
			isTeacher={roles.isUserTeacher}
			isStudent={roles.isUserStudent}
		/>
	);
}
