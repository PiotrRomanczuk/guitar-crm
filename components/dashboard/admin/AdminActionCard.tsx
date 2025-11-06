import Link from 'next/link';

interface ActionCardProps {
	href: string;
	icon: string;
	title: string;
	description: string;
	linkText: string;
}

export function AdminActionCard({
	href,
	icon,
	title,
	description,
	linkText,
}: ActionCardProps) {
	return (
		<Link
			href={href}
			className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow'
		>
			<div className='text-2xl sm:text-3xl mb-2 sm:mb-3'>{icon}</div>
			<h3 className='text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white'>
				{title}
			</h3>
			<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4'>
				{description}
			</p>
			<span className='text-blue-600 hover:text-blue-700 font-medium text-sm'>
				{linkText} →
			</span>
		</Link>
	);
}
