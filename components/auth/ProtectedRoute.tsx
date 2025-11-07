'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
	children: ReactNode;
	requireAdmin?: boolean;
	requireTeacher?: boolean;
	redirectTo?: string;
}

export default function ProtectedRoute({
	children,
	requireAdmin = false,
	requireTeacher = false,
	redirectTo = '/sign-in',
}: ProtectedRouteProps) {
	const { user, loading, isAdmin, isTeacher } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) return;

		// Check if user is authenticated
		if (!user) {
			router.push(redirectTo);
			return;
		}

		// Check admin requirement
		if (requireAdmin && !isAdmin) {
			router.push(redirectTo);
			return;
		}

		// Check teacher requirement (admins can also access teacher content)
		if (requireTeacher && !isTeacher && !isAdmin) {
			router.push(redirectTo);
			return;
		}
	}, [
		user,
		loading,
		isAdmin,
		isTeacher,
		requireAdmin,
		requireTeacher,
		router,
		redirectTo,
	]);

	// Show loading state
	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-lg'>Loading...</div>
			</div>
		);
	}

	// Show nothing while redirecting
	if (!user) {
		return null;
	}

	// Check authorization after loading
	if (requireAdmin && !isAdmin) {
		return null;
	}

	if (requireTeacher && !isTeacher && !isAdmin) {
		return null;
	}

	return <>{children}</>;
}
