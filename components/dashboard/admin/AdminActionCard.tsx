import Link from 'next/link';

interface ActionCardProps {
	href: string;
	icon: string;
	title: string;
	description: string;
	linkText: string;
	comingSoon?: boolean;
}

export function AdminActionCard({
	href,
	icon,
	title,
	description,
	linkText,
	comingSoon = false,
}: ActionCardProps) {
	const cardContent = (
		<>
			<div className='text-2xl sm:text-3xl mb-2 sm:mb-3'>{icon}</div>
			<h3 className='text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white flex items-center gap-2'>
				{title}
				{comingSoon && (
					<span className='text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-normal'>
						Coming Soon
					</span>
				)}
			</h3>
			<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4'>
				{description}
			</p>
			<span
				className={`font-medium text-sm ${
					comingSoon
						? 'text-gray-400 dark:text-gray-500'
						: 'text-blue-600 hover:text-blue-700'
				}`}
			>
				{linkText} →
			</span>
		</>
	);

	if (comingSoon) {
		return (
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 opacity-60 cursor-not-allowed'>
				{cardContent}
			</div>
		);
	}

	return (
		<Link
			href={href}
			className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow'
		>
			{cardContent}
		</Link>
	);
}
