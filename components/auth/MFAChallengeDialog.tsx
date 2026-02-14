'use client';

import { useState } from 'react';
import { challengeMFA, verifyMFA } from '@/app/actions/mfa';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormAlert from '@/components/shared/FormAlert';

interface MFAChallengeDialogProps {
	open: boolean;
	factorId: string;
	onSuccess: () => void;
	onCancel: () => void;
}

export function MFAChallengeDialog({ open, factorId, onSuccess, onCancel }: MFAChallengeDialogProps) {
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [challengeId, setChallengeId] = useState<string | null>(null);

	async function handleVerify() {
		setLoading(true);
		setError(null);

		let currentChallengeId = challengeId;

		if (!currentChallengeId) {
			const challengeResult = await challengeMFA(factorId);
			if (challengeResult.error) {
				setError(challengeResult.error);
				setLoading(false);
				return;
			}
			currentChallengeId = challengeResult.challengeId!;
			setChallengeId(currentChallengeId);
		}

		const result = await verifyMFA(factorId, currentChallengeId, code);
		setLoading(false);

		if (result.error) {
			setError(result.error);
			setCode('');
			setChallengeId(null);
			return;
		}

		onSuccess();
	}

	return (
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Two-Factor Authentication</DialogTitle>
					<DialogDescription>
						Enter the 6-digit code from your authenticator app.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{error && <FormAlert type="error" message={error} />}
					<div>
						<Label htmlFor="mfa-challenge-code">Verification Code</Label>
						<Input
							id="mfa-challenge-code"
							type="text"
							inputMode="numeric"
							maxLength={6}
							value={code}
							onChange={(e) => {
								setCode(e.target.value.replace(/\D/g, ''));
								setError(null);
							}}
							placeholder="123456"
							autoFocus
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={onCancel} disabled={loading}>
							Cancel
						</Button>
						<Button onClick={handleVerify} disabled={loading || code.length !== 6}>
							{loading ? 'Verifying...' : 'Verify'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
