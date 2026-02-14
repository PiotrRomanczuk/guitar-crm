'use client';

import { useState } from 'react';
import { requestEmailChange } from '@/app/actions/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormAlert from '@/components/shared/FormAlert';
import { Mail } from 'lucide-react';
import { z } from 'zod';

const EmailChangeSchema = z.string().email('Please enter a valid email address');

interface EmailChangeFormProps {
	currentEmail?: string;
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
	const [newEmail, setNewEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		const parsed = EmailChangeSchema.safeParse(newEmail);
		if (!parsed.success) {
			setError(parsed.error.issues[0].message);
			return;
		}

		if (newEmail.toLowerCase() === currentEmail?.toLowerCase()) {
			setError('New email must be different from your current email.');
			return;
		}

		setLoading(true);
		const result = await requestEmailChange(newEmail);
		setLoading(false);

		if (result.error) {
			setError(result.error);
		} else {
			setSuccess(result.message ?? 'Confirmation email sent.');
			setNewEmail('');
		}
	};

	return (
		<div className="rounded-lg border bg-card p-4 space-y-3">
			<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
				<Mail className="h-4 w-4" />
				Change Email
			</h3>
			{currentEmail && (
				<p className="text-sm text-muted-foreground">Current: {currentEmail}</p>
			)}
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<div>
					<Label htmlFor="new-email" className="text-sm">
						New Email Address
					</Label>
					<Input
						id="new-email"
						type="email"
						value={newEmail}
						onChange={(e) => {
							setNewEmail(e.target.value);
							setError(null);
						}}
						placeholder="newemail@example.com"
						disabled={loading}
					/>
				</div>
				{error && <FormAlert type="error" message={error} />}
				{success && <FormAlert type="success" message={success} />}
				<Button type="submit" disabled={loading || !newEmail} variant="outline" size="sm">
					{loading ? 'Sending...' : 'Send Confirmation'}
				</Button>
			</form>
		</div>
	);
}
