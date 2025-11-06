import { DashboardCard } from './DashboardCard';

export function DashboardCardGrid({
	isAdmin,
	isTeacher,
	isStudent,
}: {
	isAdmin: boolean;
	isTeacher: boolean;
	isStudent: boolean;
}) {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8'>
			{(isTeacher || isAdmin) && (
				<>
					<DashboardCard
						emoji='👥'
						title='Students'
						description='Manage your students and track their progress'
						href='/students'
					/>
					<DashboardCard
						emoji='📚'
						title='Lessons'
						description='Schedule and manage your lessons'
						href='/lessons'
					/>
				</>
			)}

			<DashboardCard
				emoji='🎵'
				title='Songs'
				description='Browse and manage your song library'
				href='/songs'
			/>

			{isStudent && (
				<DashboardCard
					emoji='📈'
					title='My Progress'
					description='Track your learning journey and achievements'
					href='/progress'
				/>
			)}

			{isAdmin && (
				<DashboardCard
					emoji='⚙️'
					title='Admin Panel'
					description='Manage users, settings, and system configuration'
					href='/admin'
				/>
			)}
		</div>
	);
}
