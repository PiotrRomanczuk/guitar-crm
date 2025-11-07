import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface UserFormHeaderProps {
	mode: 'create' | 'edit';
	onCancel: () => void;
	generalError?: string;
}

export function UserFormHeader({
	mode,
	onCancel,
	generalError,
}: UserFormHeaderProps) {
	return (
		<>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>
					{mode === 'create' ? 'Create New User' : 'Edit User'}
				</h2>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={onCancel}
					className='h-6 w-6 p-0'
				>
					<X className='h-4 w-4' />
				</Button>
			</div>

			{generalError && (
				<div className='rounded-lg border border-destructive bg-destructive/10 p-3'>
					<p className='text-sm text-destructive'>{generalError}</p>
				</div>
			)}
		</>
	);
}
