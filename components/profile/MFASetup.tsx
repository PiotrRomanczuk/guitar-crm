'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { enrollMFA, verifyMFAEnrollment, unenrollMFA, listMFAFactors } from '@/app/actions/mfa';
import { queryClient } from '@/lib/query-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormAlert from '@/components/shared/FormAlert';
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react';

type SetupStep = 'idle' | 'enrolling' | 'verifying';

export function MFASetup() {
	const [step, setStep] = useState<SetupStep>('idle');
	const [enrollData, setEnrollData] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const { data: factors = [] } = useQuery({
		queryKey: ['mfa-factors'],
		queryFn: async () => {
			const result = await listMFAFactors();
			if (result.success && result.factors) return result.factors;
			return [];
		},
		staleTime: 1000 * 60 * 5,
	});

	async function handleEnroll() {
		setLoading(true);
		setError(null);
		const result = await enrollMFA();
		setLoading(false);

		if (result.error) {
			setError(result.error);
			return;
		}

		setEnrollData({
			factorId: result.factorId!,
			qrCode: result.qrCode!,
			secret: result.secret!,
		});
		setStep('verifying');
	}

	async function handleVerify() {
		if (!enrollData) return;
		setLoading(true);
		setError(null);

		const result = await verifyMFAEnrollment(enrollData.factorId, code);
		setLoading(false);

		if (result.error) {
			setError(result.error);
			return;
		}

		setSuccess('Two-factor authentication enabled successfully.');
		setStep('idle');
		setEnrollData(null);
		setCode('');
		queryClient.invalidateQueries({ queryKey: ['mfa-factors'] });
		setTimeout(() => setSuccess(null), 5000);
	}

	async function handleUnenroll(factorId: string) {
		setLoading(true);
		setError(null);

		const result = await unenrollMFA(factorId);
		setLoading(false);

		if (result.error) {
			setError(result.error);
			return;
		}

		setSuccess('Two-factor authentication disabled.');
		queryClient.invalidateQueries({ queryKey: ['mfa-factors'] });
		setTimeout(() => setSuccess(null), 5000);
	}

	const hasMFA = factors.length > 0;

	return (
		<div className="rounded-lg border bg-card p-4 space-y-3">
			<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
				{hasMFA ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <Shield className="h-4 w-4" />}
				Two-Factor Authentication
			</h3>

			{error && <FormAlert type="error" message={error} />}
			{success && <FormAlert type="success" message={success} />}

			{hasMFA && step === 'idle' && (
				<div className="space-y-2">
					<p className="text-sm text-green-600 dark:text-green-400">2FA is enabled</p>
					{factors.map((factor) => (
						<div key={factor.id} className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								{factor.friendlyName || 'Authenticator App'}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleUnenroll(factor.id)}
								disabled={loading}
								className="text-destructive hover:text-destructive"
							>
								<ShieldOff className="h-3 w-3 mr-1" />
								Disable
							</Button>
						</div>
					))}
				</div>
			)}

			{!hasMFA && step === 'idle' && (
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">
						Add an extra layer of security to your account with a TOTP authenticator app.
					</p>
					<Button variant="outline" size="sm" onClick={handleEnroll} disabled={loading}>
						{loading ? 'Setting up...' : 'Enable 2FA'}
					</Button>
				</div>
			)}

			{step === 'verifying' && enrollData && (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Scan this QR code with your authenticator app, then enter the verification code.
					</p>
					<div className="flex justify-center">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={enrollData.qrCode} alt="QR code for authenticator app" className="w-48 h-48" />
					</div>
					<div className="text-xs text-muted-foreground text-center">
						<span>Manual entry: </span>
						<code className="bg-muted px-1 py-0.5 rounded select-all">{enrollData.secret}</code>
					</div>
					<div>
						<Label htmlFor="mfa-code" className="text-sm">Verification Code</Label>
						<Input
							id="mfa-code"
							type="text"
							inputMode="numeric"
							maxLength={6}
							value={code}
							onChange={(e) => {
								setCode(e.target.value.replace(/\D/g, ''));
								setError(null);
							}}
							placeholder="123456"
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => { setStep('idle'); setEnrollData(null); setCode(''); }}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleVerify}
							disabled={loading || code.length !== 6}
						>
							{loading ? 'Verifying...' : 'Verify & Enable'}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
