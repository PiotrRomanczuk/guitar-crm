'use client';

import { useAuth } from '@/components/auth';
import SupabaseTest from '@/components/SupabaseTest';
import Link from 'next/link';

export default function Home() {
	const { user, loading, isAdmin, isTeacher, isStudent } = useAuth();

	if (loading) {
		return (
			<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center'>
				<div className='text-xl text-gray-600 dark:text-gray-300'>
					Loading...
				</div>
			</div>
		);
	}

	// Unauthenticated landing page
	if (!user) {
		return (
			<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans'>
				<main className='container mx-auto px-4 py-8 max-w-4xl'>
					<header className='text-center mb-12'>
						<h1 className='text-5xl font-bold mb-4 text-gray-900 dark:text-white'>
							🎸 Guitar CRM
						</h1>
						<p className='text-xl text-gray-600 dark:text-gray-300 mb-2'>
							Student Management System
						</p>
						<p className='text-sm text-gray-500 dark:text-gray-400 mb-8'>
							Built with Next.js, TypeScript & Supabase
						</p>
						<div className='flex gap-4 justify-center'>
							<Link
								href='/sign-in'
								className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors'
							>
								Sign In
							</Link>
							<Link
								href='/sign-up'
								className='bg-white hover:bg-gray-50 text-blue-600 font-semibold px-6 py-3 rounded-lg border-2 border-blue-600 transition-colors'
							>
								Sign Up
							</Link>
						</div>
					</header>

					<div className='space-y-8'>
						<SupabaseTest />

						<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
							<h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
								🚀 Development Ready
							</h2>
							<div className='grid md:grid-cols-2 gap-6'>
								<div>
									<h3 className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200'>
										✅ Project Features
									</h3>
									<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
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
									<h3 className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200'>
										🛠️ Development Scripts
									</h3>
									<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
										<li>
											<code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>
												npm run setup
											</code>{' '}
											- Environment setup
										</li>
										<li>
											<code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>
												npm run new-feature
											</code>{' '}
											- Create feature branch
										</li>
										<li>
											<code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>
												npm run tdd
											</code>{' '}
											- Start TDD mode
										</li>
										<li>
											<code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>
												npm run quality
											</code>{' '}
											- Code quality checks
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	// Authenticated dashboard
	const userRoles = [];
	if (isAdmin) userRoles.push('Admin');
	if (isTeacher) userRoles.push('Teacher');
	if (isStudent) userRoles.push('Student');
	const roleText = userRoles.length > 0 ? userRoles.join(', ') : 'User';

	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans'>
			<main className='container mx-auto px-4 py-8 max-w-6xl'>
				<header className='mb-12'>
					<div className='flex justify-between items-start mb-6'>
						<div>
							<h1 className='text-4xl font-bold mb-2 text-gray-900 dark:text-white'>
								🎸 Welcome Back!
							</h1>
							<p className='text-lg text-gray-600 dark:text-gray-300'>
								{user.email}
							</p>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Role: {roleText}
							</p>
						</div>
					</div>
				</header>

				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
					{/* Dashboard Cards */}
					{(isTeacher || isAdmin) && (
						<>
							<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
								<div className='text-3xl mb-2'>👥</div>
								<h3 className='text-xl font-semibold mb-2 text-gray-900 dark:text-white'>
									Students
								</h3>
								<p className='text-gray-600 dark:text-gray-300 mb-4'>
									Manage your students and track their progress
								</p>
								<Link
									href='/students'
									className='text-blue-600 hover:text-blue-700 font-medium'
								>
									View Students →
								</Link>
							</div>

							<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
								<div className='text-3xl mb-2'>📚</div>
								<h3 className='text-xl font-semibold mb-2 text-gray-900 dark:text-white'>
									Lessons
								</h3>
								<p className='text-gray-600 dark:text-gray-300 mb-4'>
									Schedule and manage your lessons
								</p>
								<Link
									href='/lessons'
									className='text-blue-600 hover:text-blue-700 font-medium'
								>
									View Lessons →
								</Link>
							</div>
						</>
					)}

					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
						<div className='text-3xl mb-2'>🎵</div>
						<h3 className='text-xl font-semibold mb-2 text-gray-900 dark:text-white'>
							Songs
						</h3>
						<p className='text-gray-600 dark:text-gray-300 mb-4'>
							Browse and manage your song library
						</p>
						<Link
							href='/songs'
							className='text-blue-600 hover:text-blue-700 font-medium'
						>
							View Songs →
						</Link>
					</div>

					{isStudent && (
						<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
							<div className='text-3xl mb-2'>📈</div>
							<h3 className='text-xl font-semibold mb-2 text-gray-900 dark:text-white'>
								My Progress
							</h3>
							<p className='text-gray-600 dark:text-gray-300 mb-4'>
								Track your learning journey and achievements
							</p>
							<Link
								href='/progress'
								className='text-blue-600 hover:text-blue-700 font-medium'
							>
								View Progress →
							</Link>
						</div>
					)}

					{isAdmin && (
						<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
							<div className='text-3xl mb-2'>⚙️</div>
							<h3 className='text-xl font-semibold mb-2 text-gray-900 dark:text-white'>
								Admin Panel
							</h3>
							<p className='text-gray-600 dark:text-gray-300 mb-4'>
								Manage users, settings, and system configuration
							</p>
							<Link
								href='/admin'
								className='text-blue-600 hover:text-blue-700 font-medium'
							>
								Admin Panel →
							</Link>
						</div>
					)}
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
					<h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
						🚀 Quick Actions
					</h2>
					<div className='grid md:grid-cols-2 gap-4'>
						{(isTeacher || isAdmin) && (
							<>
								<button className='text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors'>
									<div className='font-semibold text-gray-900 dark:text-white mb-1'>
										📅 Schedule Lesson
									</div>
									<div className='text-sm text-gray-600 dark:text-gray-400'>
										Create a new lesson with a student
									</div>
								</button>
								<button className='text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors'>
									<div className='font-semibold text-gray-900 dark:text-white mb-1'>
										➕ Add Student
									</div>
									<div className='text-sm text-gray-600 dark:text-gray-400'>
										Register a new student
									</div>
								</button>
							</>
						)}
						<button className='text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors'>
							<div className='font-semibold text-gray-900 dark:text-white mb-1'>
								🎸 Add Song
							</div>
							<div className='text-sm text-gray-600 dark:text-gray-400'>
								Add a new song to the library
							</div>
						</button>
						<button className='text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors'>
							<div className='font-semibold text-gray-900 dark:text-white mb-1'>
								⭐ View Favorites
							</div>
							<div className='text-sm text-gray-600 dark:text-gray-400'>
								See your favorite songs
							</div>
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
