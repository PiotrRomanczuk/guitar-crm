import {
	LandingPage,
	DashboardHeader,
	DashboardCardGrid,
	QuickActionsSection,
} from './home.components';
import getUserRoles from '@/lib/getUserRoles';
import { createClient } from '@/utils/supabase/clients/server';

async function DashboardPageContent({
	email,
	isAdmin,
	isTeacher,
	isStudent,
}: {
	email: string | undefined;
	isAdmin: boolean;
	isTeacher: boolean;
	isStudent: boolean;
}) {
	const userRoles: string[] = [];
	if (isAdmin) userRoles.push('Admin');
	if (isTeacher) userRoles.push('Teacher');
	if (isStudent) userRoles.push('Student');
	const roleText = userRoles.length > 0 ? userRoles.join(', ') : 'User';

	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans'>
			<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl'>
				<DashboardHeader email={email} roleText={roleText} />
				role text - {roleText}
				<DashboardCardGrid
					isAdmin={isAdmin}
					isTeacher={isTeacher}
					isStudent={isStudent}
				/>
				<QuickActionsSection isAdmin={isAdmin} isTeacher={isTeacher} />
			</main>
		</div>
	);
}

export default async function Home() {
	// Server-side auth: use Supabase server client with cookie-based session
	const supabase = await createClient();
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
