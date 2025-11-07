interface StatCardProps {
	icon: string;
	value: string;
	label: string;
}

export function AdminStatCard({ icon, value, label }: StatCardProps) {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6'>
			<div className='text-2xl sm:text-3xl mb-1 sm:mb-2'>{icon}</div>
			<h3 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-1'>
				{value}
			</h3>
			<p className='text-xs sm:text-base text-gray-600 dark:text-gray-300'>
				{label}
			</p>
		</div>
	);
}
