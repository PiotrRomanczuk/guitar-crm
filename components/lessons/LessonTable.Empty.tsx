interface Props {
	role: 'admin' | 'teacher' | 'student';
}

export default function LessonTableEmpty({ role }: Props) {
	return (
		<div
			data-testid='empty-state'
			className='text-center py-8 text-gray-500 dark:text-gray-400'
		>
			<p className='text-lg'>No lessons found</p>
			<p className='text-sm mt-2'>
				{role === 'student'
					? "You haven't been scheduled for any lessons yet."
					: 'Create your first lesson to get started.'}
			</p>
		</div>
	);
}
