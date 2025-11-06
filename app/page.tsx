import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { LandingPage } from '@/components/home';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export default async function Home() {
	const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

	// If not authenticated, show the marketing/landing page
	if (!user) {
		return <LandingPage />;
	}

	return (
		<DashboardPageContent
			email={user.email}
			isAdmin={isAdmin}
			isTeacher={isTeacher}
			isStudent={isStudent}
		/>
	);
}
