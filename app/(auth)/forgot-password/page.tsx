'use client';

import { ForgotPasswordForm } from '@/components/auth';

export default function ForgotPasswordPage() {
	return (
		<div className='min-h-screen bg-linear-to-br from-primary/5 to-primary/10 dark:from-background dark:to-muted flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8'>
			<div className='max-w-md w-full bg-background rounded-lg shadow-xl p-4 sm:p-8'>
				<div className='text-center mb-6 sm:mb-8'>
					<h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-2'>
						Guitar CRM
					</h1>
					<p className='text-xs sm:text-sm text-muted-foreground'>
						Reset your password
					</p>
				</div>
				<ForgotPasswordForm />
			</div>
		</div>
	);
}
