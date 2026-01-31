import { ResetPasswordForm } from '@/components/auth';
import Link from 'next/link';

export default function ResetPasswordPage() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-muted'>
			<div className='sm:mx-auto sm:w-full sm:max-w-md'>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-foreground'>
					Reset your password
				</h2>
				<p className='mt-2 text-center text-sm text-muted-foreground'>
					Enter your new password below.
				</p>
			</div>

			<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
				<div className='bg-background py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<ResetPasswordForm />
					<div className='mt-6'>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-border' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='bg-background px-2 text-muted-foreground'>
									Or go back to
								</span>
							</div>
						</div>

						<div className='mt-6 grid grid-cols-1 gap-3'>
							<Link
								href='/sign-in'
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-background hover:bg-muted'
							>
								Sign in
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
