import { ResetPasswordForm } from '@/components/auth';
import Link from 'next/link';

export default function ResetPasswordPage() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-gray-50'>
			<div className='sm:mx-auto sm:w-full sm:max-w-md'>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
					Reset your password
				</h2>
				<p className='mt-2 text-center text-sm text-gray-600'>
					Enter your new password below.
				</p>
			</div>

			<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
				<div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<ResetPasswordForm />
					<div className='mt-6'>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-300' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='bg-white px-2 text-gray-500'>
									Or go back to
								</span>
							</div>
						</div>

						<div className='mt-6 grid grid-cols-1 gap-3'>
							<Link
								href='/sign-in'
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50'
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
