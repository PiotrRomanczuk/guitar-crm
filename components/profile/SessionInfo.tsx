'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Clock, LogIn } from 'lucide-react';

interface SessionData {
	last_sign_in_at: string | null;
	sign_in_count: number;
}

async function fetchSessionInfo(userId: string): Promise<SessionData> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from('profiles')
		.select('last_sign_in_at, sign_in_count')
		.eq('id', userId)
		.single();

	if (error) throw error;
	return { last_sign_in_at: data.last_sign_in_at, sign_in_count: data.sign_in_count ?? 0 };
}

function formatDate(iso: string | null): string {
	if (!iso) return 'Never';
	return new Date(iso).toLocaleString(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	});
}

interface SessionInfoProps {
	userId: string;
}

export function SessionInfo({ userId }: SessionInfoProps) {
	const { data, isLoading } = useQuery({
		queryKey: ['session-info', userId],
		queryFn: () => fetchSessionInfo(userId),
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading || !data) return null;

	return (
		<div className="rounded-lg border bg-card p-4 space-y-3">
			<h3 className="text-sm font-semibold text-foreground">Session Activity</h3>
			<div className="flex flex-col gap-2 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4" />
					<span>Last sign-in: {formatDate(data.last_sign_in_at)}</span>
				</div>
				<div className="flex items-center gap-2">
					<LogIn className="h-4 w-4" />
					<span>Total sign-ins: {data.sign_in_count}</span>
				</div>
			</div>
		</div>
	);
}
