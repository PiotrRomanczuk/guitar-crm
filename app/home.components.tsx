import Link from 'next/link';
import SupabaseTest from '@/components/SupabaseTest';

export function LoadingScreen() {
	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center'>
			<div className='text-lg sm:text-xl text-gray-600 dark:text-gray-300'>
				Loading...
			</div>
		</div>
	);
}

export function LandingHeader() {
	return (
		<header className='text-center mb-8 sm:mb-12'>
			<h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white'>
				🎸 Guitar CRM
			</h1>
			<p className='text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-2'>
				Student Management System
			</p>
			<p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8'>
				Built with Next.js, TypeScript & Supabase
			</p>
			<div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
				<Link
					href='/sign-in'
					className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base'
				>
					Sign In
				</Link>
				<Link
					href='/sign-up'
					className='bg-white hover:bg-gray-50 text-blue-600 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-blue-600 transition-colors text-sm sm:text-base'
				>
					Sign Up
				</Link>
			</div>
		</header>
	);
}

export function FeaturesSection() {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6'>
			<h2 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white'>
				🚀 Development Ready
			</h2>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
				<div>
					<h3 className='text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-200'>
						✅ Project Features
					</h3>
					<ul className='space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300'>
						<li>• Next.js 16 with App Router</li>
						<li>• TypeScript with strict typing</li>
						<li>• Supabase database integration</li>
						<li>• Zod schema validation</li>
						<li>• Jest testing framework</li>
						<li>• TDD workflow automation</li>
						<li>• Tailwind CSS styling</li>
						<li>• Vercel deployment ready</li>
					</ul>
				</div>
				<div>
					<h3 className='text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-200'>
						🛠️ Development Scripts
					</h3>
					<ul className='space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300'>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run setup
							</code>{' '}
							- Setup
						</li>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run new-feature
							</code>{' '}
							- Feature branch
						</li>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run tdd
							</code>{' '}
							- TDD mode
						</li>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run quality
							</code>{' '}
							- Quality checks
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export function LandingPage() {
	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans'>
			<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl'>
				<LandingHeader />

				<div className='space-y-6 sm:space-y-8'>
					<SupabaseTest />
					<FeaturesSection />
				</div>
			</main>
		</div>
	);
}

export function DashboardCard({
	emoji,
	title,
	description,
	href,
}: {
	emoji: string;
	title: string;
	description: string;
	href: string;
}) {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow'>
			<div className='text-2xl sm:text-3xl mb-2'>{emoji}</div>
			<h3 className='text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white'>
				{title}
			</h3>
			<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4'>
				{description}
			</p>
			<Link
				href={href}
				className='text-blue-600 hover:text-blue-700 font-medium text-sm'
			>
				View →
			</Link>
		</div>
	);
}

export function QuickActionButton({
	emoji,
	title,
	description,
}: {
	emoji: string;
	title: string;
	description: string;
}) {
	return (
		<button className='text-left p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors w-full'>
			<div className='font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base'>
				{emoji} {title}
			</div>
			<div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
				{description}
			</div>
		</button>
	);
}

export function DashboardHeader({
	email,
	roleText,
}: {
	email: string | undefined;
	roleText: string;
}) {
	return (
		<header className='mb-8 sm:mb-12'>
			<div className='flex flex-col sm:flex-row justify-between items-start gap-4'>
				<div>
					<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white'>
						🎸 Welcome Back!
					</h1>
					<p className='text-xs sm:text-base text-gray-600 dark:text-gray-300 break-all'>
						{email}
					</p>
					<p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1'>
						Role: {roleText}
					</p>
				</div>
			</div>
		</header>
	);
}

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
			{/* User Account Section - Always visible */}
			<DashboardCard
				emoji='👤'
				title='Edit Profile'
				description='Update your personal information and bio'
				href='/profile'
			/>
			<DashboardCard
				emoji='⚙️'
				title='Settings'
				description='Manage preferences, notifications, and privacy'
				href='/settings'
			/>

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
					emoji='🔧'
					title='Admin Panel'
					description='Manage users, settings, and system configuration'
					href='/admin'
				/>
			)}
		</div>
	);
}

export function QuickActionsSection({
	isAdmin,
	isTeacher,
}: {
	isAdmin: boolean;
	isTeacher: boolean;
}) {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6'>
			<h2 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white'>
				🚀 Quick Actions
			</h2>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
				{(isTeacher || isAdmin) && (
					<>
						<QuickActionButton
							emoji='📅'
							title='Schedule Lesson'
							description='Create a new lesson with a student'
						/>
						<QuickActionButton
							emoji='➕'
							title='Add Student'
							description='Register a new student'
						/>
					</>
				)}
				<QuickActionButton
					emoji='🎸'
					title='Add Song'
					description='Add a new song to the library'
				/>
				<QuickActionButton
					emoji='⭐'
					title='View Favorites'
					description='See your favorite songs'
				/>
			</div>
		</div>
	);
}
