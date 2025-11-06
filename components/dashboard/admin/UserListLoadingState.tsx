'use client';

import { Input } from '@/components/ui/input';

export function UserListLoadingState() {
	return (
		<div className='space-y-4'>
			<div className='mb-4 sm:mb-6'>
				<Input
					type='text'
					placeholder='Search users by name or email...'
					className='animate-pulse text-xs sm:text-sm'
					disabled
				/>
			</div>
			{[...Array(3)].map((_, i) => (
				<div key={i} className='rounded-lg border p-3 sm:p-6 animate-pulse'>
					<div className='flex items-center space-x-2 sm:space-x-4'>
						<div className='w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full'></div>
						<div className='flex-1'>
							<div className='h-4 bg-muted rounded w-1/4 mb-2'></div>
							<div className='h-3 bg-muted rounded w-1/3'></div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
