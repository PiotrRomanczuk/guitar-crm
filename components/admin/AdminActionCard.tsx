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
			className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'
		>
			<div className='text-3xl mb-3'>{icon}</div>
			<h3 className='text-xl font-semibold mb-2 text-gray-900 dark:text-white'>
				{title}
			</h3>
			<p className='text-gray-600 dark:text-gray-300 mb-4'>{description}</p>
			<span className='text-blue-600 hover:text-blue-700 font-medium'>
				{linkText} →
			</span>
		</Link>
	);
}
