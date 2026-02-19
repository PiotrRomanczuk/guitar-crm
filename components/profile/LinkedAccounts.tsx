'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listIdentities, unlinkIdentity } from '@/app/actions/identity';
import { queryClient } from '@/lib/query-client';
import { Button } from '@/components/ui/button';
import FormAlert from '@/components/shared/FormAlert';
import { Link2, Unlink } from 'lucide-react';

const providerLabels: Record<string, string> = {
	email: 'Email / Password',
	google: 'Google',
	github: 'GitHub',
	apple: 'Apple',
};

export function LinkedAccounts() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const { data: identities = [] } = useQuery({
		queryKey: ['identities'],
		queryFn: async () => {
			const result = await listIdentities();
			if (result.success && result.identities) return result.identities;
			return [];
		},
		staleTime: 1000 * 60 * 5,
	});

	async function handleUnlink(identityId: string) {
		setLoading(true);
		setError(null);
		setSuccess(null);

		const result = await unlinkIdentity(identityId);
		setLoading(false);

		if (result.error) {
			setError(result.error);
			return;
		}

		setSuccess('Account unlinked successfully.');
		queryClient.invalidateQueries({ queryKey: ['identities'] });
		setTimeout(() => setSuccess(null), 5000);
	}

	return (
		<div className="rounded-lg border bg-card p-4 space-y-3">
			<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
				<Link2 className="h-4 w-4" />
				Linked Accounts
			</h3>

			{error && <FormAlert type="error" message={error} />}
			{success && <FormAlert type="success" message={success} />}

			{identities.length === 0 ? (
				<p className="text-sm text-muted-foreground">No linked accounts found.</p>
			) : (
				<div className="space-y-2">
					{identities.map((identity) => (
						<div
							key={identity.id}
							className="flex items-center justify-between text-sm py-1"
						>
							<span className="text-muted-foreground">
								{providerLabels[identity.provider] || identity.provider}
							</span>
							{identity.provider !== 'email' && identities.length > 1 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleUnlink(identity.id)}
									disabled={loading}
									className="text-destructive hover:text-destructive"
								>
									<Unlink className="h-3 w-3 mr-1" />
									Unlink
								</Button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
