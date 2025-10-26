'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface RequireRoleProps {
	children: ReactNode;
	redirectTo?: string;
	loadingComponent?: ReactNode;
}

/**
 * Base component for authentication requirement
 * Ensures user is logged in before rendering children
 */
export function RequireAuth({
	children,
	redirectTo = '/sign-in',
	loadingComponent,
}: RequireRoleProps) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.push(redirectTo);
		}
	}, [user, loading, router, redirectTo]);

	if (loading) {
		return (
			<>
				{loadingComponent || (
					<div className='min-h-screen flex items-center justify-center'>
						<div className='text-xl text-gray-600 dark:text-gray-300'>
							Loading...
						</div>
					</div>
				)}
			</>
		);
	}

	if (!user) {
		return null;
	}

	return <>{children}</>;
}

/**
 * Requires user to be an admin
 * Redirects non-admins to home page, unauthenticated to sign-in
 */
export function RequireAdmin({
	children,
	redirectTo,
	loadingComponent,
}: RequireRoleProps) {
	const { user, loading, isAdmin } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push(redirectTo || '/sign-in');
			} else if (!isAdmin) {
				router.push(redirectTo || '/');
			}
		}
	}, [user, loading, isAdmin, router, redirectTo]);

	if (loading) {
		return (
			<>
				{loadingComponent || (
					<div className='min-h-screen flex items-center justify-center'>
						<div className='text-xl text-gray-600 dark:text-gray-300'>
							Loading...
						</div>
					</div>
				)}
			</>
		);
	}

	if (!user || !isAdmin) {
		return null;
	}

	return <>{children}</>;
}

/**
 * Requires user to be a teacher or admin
 * Teachers can access, admins can access everything
 */
export function RequireTeacher({
	children,
	redirectTo,
	loadingComponent,
}: RequireRoleProps) {
	const { user, loading, isTeacher, isAdmin } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push(redirectTo || '/sign-in');
			} else if (!isTeacher && !isAdmin) {
				router.push(redirectTo || '/');
			}
		}
	}, [user, loading, isTeacher, isAdmin, router, redirectTo]);

	if (loading) {
		return (
			<>
				{loadingComponent || (
					<div className='min-h-screen flex items-center justify-center'>
						<div className='text-xl text-gray-600 dark:text-gray-300'>
							Loading...
						</div>
					</div>
				)}
			</>
		);
	}

	if (!user || (!isTeacher && !isAdmin)) {
		return null;
	}

	return <>{children}</>;
}

/**
 * Requires user to be a student or admin
 * Students can access, admins can access everything
 */
export function RequireStudent({
	children,
	redirectTo,
	loadingComponent,
}: RequireRoleProps) {
	const { user, loading, isStudent, isAdmin } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push(redirectTo || '/sign-in');
			} else if (!isStudent && !isAdmin) {
				router.push(redirectTo || '/');
			}
		}
	}, [user, loading, isStudent, isAdmin, router, redirectTo]);

	if (loading) {
		return (
			<>
				{loadingComponent || (
					<div className='min-h-screen flex items-center justify-center'>
						<div className='text-xl text-gray-600 dark:text-gray-300'>
							Loading...
						</div>
					</div>
				)}
			</>
		);
	}

	if (!user || (!isStudent && !isAdmin)) {
		return null;
	}

	return <>{children}</>;
}
