interface StatCardProps {
	icon: string;
	value: string;
	label: string;
}

export function AdminStatCard({ icon, value, label }: StatCardProps) {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
			<div className='text-3xl mb-2'>{icon}</div>
			<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>
				{value}
			</h3>
			<p className='text-gray-600 dark:text-gray-300'>{label}</p>
		</div>
	);
}
