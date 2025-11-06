import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface UserFormActionsProps {
	mode: 'create' | 'edit';
	loading: boolean;
	onCancel: () => void;
}

export function UserFormActions({
	mode,
	loading,
	onCancel,
}: UserFormActionsProps) {
	return (
		<div className='flex justify-end space-x-3 pt-4 border-t'>
			<Button
				type='button'
				variant='outline'
				onClick={onCancel}
				disabled={loading}
			>
				Cancel
			</Button>
			<Button type='submit' disabled={loading}>
				{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				{mode === 'create' ? 'Create User' : 'Update User'}
			</Button>
		</div>
	);
}
