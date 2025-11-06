'use client';

import { AuthProvider } from '@/components/auth';

export default function ClientProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AuthProvider>{children}</AuthProvider>;
}
