'use client';

import { useState } from 'react';
import { requestAccountDeletion, cancelAccountDeletion } from '@/app/actions/account';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormAlert from '@/components/shared/FormAlert';
import { Trash2 } from 'lucide-react';

interface AccountDeletionDialogProps {
	deletionScheduledFor?: string | null;
}

export function AccountDeletionDialog({ deletionScheduledFor }: AccountDeletionDialogProps) {
	const [confirmText, setConfirmText] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [scheduledFor, setScheduledFor] = useState<string | null>(deletionScheduledFor ?? null);

	const handleRequestDeletion = async () => {
		setLoading(true);
		setError(null);
		const result = await requestAccountDeletion();
		setLoading(false);

		if (result.error) {
			setError(result.error);
		} else {
			setScheduledFor(result.scheduledFor ?? null);
		}
	};

	const handleCancelDeletion = async () => {
		setLoading(true);
		setError(null);
		const result = await cancelAccountDeletion();
		setLoading(false);

		if (result.error) {
			setError(result.error);
		} else {
			setScheduledFor(null);
		}
	};

	if (scheduledFor) {
		const date = new Date(scheduledFor).toLocaleDateString(undefined, { dateStyle: 'long' });
		return (
			<div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
				<h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
					<Trash2 className="h-4 w-4" />
					Account Scheduled for Deletion
				</h3>
				<p className="text-sm text-muted-foreground">
					Your account will be permanently deleted on <strong>{date}</strong>. You can cancel this at any
					time before that date.
				</p>
				{error && <FormAlert type="error" message={error} />}
				<Button
					variant="outline"
					size="sm"
					onClick={handleCancelDeletion}
					disabled={loading}
				>
					{loading ? 'Cancelling...' : 'Cancel Deletion'}
				</Button>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-destructive/50 bg-card p-4 space-y-3">
			<h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
				<Trash2 className="h-4 w-4" />
				Delete Account
			</h3>
			<p className="text-sm text-muted-foreground">
				Permanently delete your account and all associated data. This action has a 30-day
				grace period during which you can cancel.
			</p>
			{error && <FormAlert type="error" message={error} />}
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="destructive" size="sm">
						Delete Account
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will schedule your account for deletion in 30 days. All your data
							including lessons, songs, and assignments will be permanently removed.
							Type <strong>DELETE</strong> to confirm.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<Input
						value={confirmText}
						onChange={(e) => setConfirmText(e.target.value)}
						placeholder='Type "DELETE" to confirm'
					/>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmText('')}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRequestDeletion}
							disabled={confirmText !== 'DELETE' || loading}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{loading ? 'Processing...' : 'Delete My Account'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
