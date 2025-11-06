export function QuickActionButton({
	emoji,
	title,
	description,
}: {
	emoji: string;
	title: string;
	description: string;
}) {
	return (
		<button className='text-left p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors w-full'>
			<div className='font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base'>
				{emoji} {title}
			</div>
			<div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
				{description}
			</div>
		</button>
	);
}
