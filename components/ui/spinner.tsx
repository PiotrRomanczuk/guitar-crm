'use client';

import { cn } from '@/lib/utils';

export interface SpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeClasses = {
	sm: 'h-4 w-4',
	md: 'h-8 w-8',
	lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
	return (
		<div
			role='status'
			className={cn(
				'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
				sizeClasses[size],
				className
			)}
		>
			<span className='sr-only'>Loading...</span>
		</div>
	);
}
