export function FeaturesSection() {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6'>
			<h2 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white'>
				🚀 Development Ready
			</h2>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
				<div>
					<h3 className='text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-200'>
						✅ Project Features
					</h3>
					<ul className='space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300'>
						<li>• Next.js 16 with App Router</li>
						<li>• TypeScript with strict typing</li>
						<li>• Supabase database integration</li>
						<li>• Zod schema validation</li>
						<li>• Jest testing framework</li>
						<li>• TDD workflow automation</li>
						<li>• Tailwind CSS styling</li>
						<li>• Vercel deployment ready</li>
					</ul>
				</div>
				<div>
					<h3 className='text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-200'>
						🛠️ Development Scripts
					</h3>
					<ul className='space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300'>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run setup
							</code>{' '}
							- Setup
						</li>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run new-feature
							</code>{' '}
							- Feature branch
						</li>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run tdd
							</code>{' '}
							- TDD mode
						</li>
						<li>
							<code className='bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								npm run quality
							</code>{' '}
							- Quality checks
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
