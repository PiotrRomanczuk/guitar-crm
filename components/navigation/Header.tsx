'use client';

import { useAuth } from '@/components/auth';
import { useRouter } from 'next/navigation';
import { RoleBasedNav } from './RoleBasedNav';

export default function Header() {
	const { user, loading, signOut, isAdmin, isTeacher, isStudent } = useAuth();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push('/sign-in');
	};

	const roles = [];
	if (isAdmin) roles.push('Admin');
	if (isTeacher) roles.push('Teacher');
	if (isStudent) roles.push('Student');

	return (
		<header className='bg-white dark:bg-gray-800 shadow-md'>
			<div className='container mx-auto px-4 py-4'>
				<div className='flex justify-between items-center'>
					{/* Logo */}
					<button
						onClick={() => router.push('/')}
						className='text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
					>
						🎸 Guitar CRM
					</button>

					{/* Navigation */}
					{user && (
						<div className='flex-1 mx-8'>
							<RoleBasedNav />
						</div>
					)}

					{/* Auth Controls */}
					<div className='flex items-center gap-4'>
						{loading ? (
							<div className='text-gray-500 dark:text-gray-400'>Loading...</div>
						) : user ? (
							<>
								<div className='flex flex-col items-end'>
									<div className='text-sm font-medium text-gray-900 dark:text-white'>
										{user.email}
									</div>
									{roles.length > 0 && (
										<div className='flex gap-1 mt-1'>
											{roles.map((role) => (
												<span
													key={role}
													className='text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
												>
													{role}
												</span>
											))}
										</div>
									)}
								</div>
								<button
									onClick={handleSignOut}
									className='bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
								>
									Sign Out
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => router.push('/sign-in')}
									className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors'
								>
									Sign In
								</button>
								<button
									onClick={() => router.push('/sign-up')}
									className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
								>
									Sign Up
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
