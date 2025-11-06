import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

interface ProfileLoadingStateProps {
	loading: boolean;
}

export function ProfileLoadingState({ loading }: ProfileLoadingStateProps) {
	if (!loading) return null;

	return (
		<div className='min-h-screen bg-background flex items-center justify-center'>
			<Spinner size='lg' />
		</div>
	);
}

export function ProfileHeader() {
	return (
		<header className='mb-6 sm:mb-8'>
			<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2'>
				👤 Edit Profile
			</h1>
			<p className='text-xs sm:text-base lg:text-lg text-muted-foreground'>
				Update your personal information
			</p>
		</header>
	);
}

interface ProfileAlertProps {
	type: 'error' | 'success';
	message: string;
}

export function ProfileAlert({ type, message }: ProfileAlertProps) {
	if (type === 'error') {
		return (
			<div className='mb-6 rounded-lg border border-destructive bg-destructive/10 p-4'>
				<p className='font-semibold text-destructive text-sm sm:text-base'>
					Error
				</p>
				<p className='text-destructive mt-1 text-xs sm:text-sm'>{message}</p>
			</div>
		);
	}

	return (
		<div className='mb-6 rounded-lg border border-green-600 bg-green-50 dark:bg-green-900/20 p-4'>
			<p className='font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base'>
				✓ {message}
			</p>
		</div>
	);
}

interface ProfileFormActionsProps {
	saving: boolean;
	onCancel: () => void;
}

export function ProfileFormActions({
	saving,
	onCancel,
}: ProfileFormActionsProps) {
	return (
		<div className='flex flex-col sm:flex-row gap-3 pt-4'>
			<Button type='submit' disabled={saving} className='w-full sm:w-auto'>
				{saving ? (
					<>
						<Spinner size='sm' className='mr-2' />
						Saving...
					</>
				) : (
					'Save Changes'
				)}
			</Button>
			<Button
				type='button'
				variant='outline'
				onClick={onCancel}
				disabled={saving}
				className='w-full sm:w-auto'
			>
				Cancel
			</Button>
		</div>
	);
}
