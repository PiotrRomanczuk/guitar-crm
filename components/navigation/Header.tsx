'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth';
import { useRouter } from 'next/navigation';
import { RoleBasedNav } from './RoleBasedNav';

function MobileMenuButton({
	open,
	onClick,
}: {
	open: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className='md:hidden ml-4 p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
			aria-label='Toggle menu'
		>
			<svg
				className='w-6 h-6'
				fill='none'
				stroke='currentColor'
				viewBox='0 0 24 24'
			>
				{open ? (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M6 18L18 6M6 6l12 12'
					/>
				) : (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M4 6h16M4 12h16M4 18h16'
					/>
				)}
			</svg>
		</button>
	);
}

function RoleDisplay({ roles }: { roles: string[] }) {
	if (roles.length === 0) return null;
	return (
		<div className='flex gap-1 mt-1 flex-wrap'>
			{roles.map((role) => (
				<span
					key={role}
					className='text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
				>
					{role}
				</span>
			))}
		</div>
	);
}

function DesktopAuthControls({
	user,
	loading,
	roles,
	onSignOut,
	onSignIn,
	onSignUp,
}: {
	user: { email?: string } | null;
	loading: boolean;
	roles: string[];
	onSignOut: () => void;
	onSignIn: () => void;
	onSignUp: () => void;
}) {
	return (
		<div className='hidden sm:flex items-center gap-2 sm:gap-4'>
			{loading ? (
				<div className='text-gray-500 dark:text-gray-400 text-sm'>
					Loading...
				</div>
			) : user ? (
				<>
					<div className='hidden sm:flex flex-col items-end'>
						<div className='text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate'>
							{user.email}
						</div>
						<RoleDisplay roles={roles} />
					</div>
					<button
						onClick={onSignOut}
						className='bg-red-600 hover:bg-red-700 text-white font-medium px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm'
					>
						Sign Out
					</button>
				</>
			) : (
				<>
					<button
						onClick={onSignIn}
						className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm'
					>
						Sign In
					</button>
					<button
						onClick={onSignUp}
						className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm'
					>
						Sign Up
					</button>
				</>
			)}
		</div>
	);
}

function MobileMenu({
	open,
	user,
	loading,
	roles,
	onSignOut,
	onSignIn,
	onSignUp,
}: {
	open: boolean;
	user: { email?: string } | null;
	loading: boolean;
	roles: string[];
	onSignOut: () => void;
	onSignIn: () => void;
	onSignUp: () => void;
}) {
	if (!open) return null;

	return (
		<div className='md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4'>
			{user && (
				<div className='mb-4'>
					<RoleBasedNav />
				</div>
			)}

			<div className='flex sm:hidden flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
				{loading ? (
					<div className='text-gray-500 dark:text-gray-400'>Loading...</div>
				) : user ? (
					<>
						<div className='flex flex-col py-2 px-2'>
							<div className='text-sm font-medium text-gray-900 dark:text-white break-all'>
								{user.email}
							</div>
							<RoleDisplay roles={roles} />
						</div>
						<button
							onClick={onSignOut}
							className='w-full text-left bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
						>
							Sign Out
						</button>
					</>
				) : (
					<>
						<button
							onClick={onSignIn}
							className='text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-4 py-2'
						>
							Sign In
						</button>
						<button
							onClick={onSignUp}
							className='w-full text-left bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
						>
							Sign Up
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default function Header() {
	const { user, loading, signOut, isAdmin, isTeacher, isStudent } = useAuth();
	const router = useRouter();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleSignOut = async () => {
		await signOut();
		router.push('/sign-in');
		setMobileMenuOpen(false);
	};

	const handleNavigation = (path: string) => {
		router.push(path);
		setMobileMenuOpen(false);
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
						onClick={() => handleNavigation('/')}
						className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate'
					>
						🎸 Guitar CRM
					</button>

					{/* Navigation - Hidden on mobile */}
					{user && (
						<div className='hidden md:flex flex-1 mx-8'>
							<RoleBasedNav />
						</div>
					)}

					{/* Mobile Menu Button */}
					<MobileMenuButton
						open={mobileMenuOpen}
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					/>

					{/* Desktop Auth Controls */}
					<DesktopAuthControls
						user={user}
						loading={loading}
						roles={roles}
						onSignOut={handleSignOut}
						onSignIn={() => handleNavigation('/sign-in')}
						onSignUp={() => handleNavigation('/sign-up')}
					/>
				</div>

				{/* Mobile Menu */}
				<MobileMenu
					open={mobileMenuOpen}
					user={user}
					loading={loading}
					roles={roles}
					onSignOut={handleSignOut}
					onSignIn={() => handleNavigation('/sign-in')}
					onSignUp={() => handleNavigation('/sign-up')}
				/>
			</div>
		</header>
	);
}
