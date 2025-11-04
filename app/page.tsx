import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { LandingPage } from '@/components/home';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export default async function Home() {
	const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

	// console.log(user, isAdmin, isTeacher, isStudent);
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
