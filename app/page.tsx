'use client';

import { useAuth } from '@/components/auth';
import {
	LoadingScreen,
	LandingPage,
	DashboardCard,
	QuickActionButton,
	DashboardHeader,
	DashboardCardGrid,
	QuickActionsSection,
} from './home.components';

function DashboardPageContent({
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
	const userRoles = [];
	if (isAdmin) userRoles.push('Admin');
	if (isTeacher) userRoles.push('Teacher');
	if (isStudent) userRoles.push('Student');
	const roleText = userRoles.length > 0 ? userRoles.join(', ') : 'User';

	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans'>
			<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl'>
				<DashboardHeader email={email} roleText={roleText} />
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

export default function Home() {
	const { user, loading, isAdmin, isTeacher, isStudent } = useAuth();

	if (loading) {
		return <LoadingScreen />;
	}

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
