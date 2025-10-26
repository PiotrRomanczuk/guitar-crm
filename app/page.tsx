import SupabaseTest from '@/components/SupabaseTest';

export default function Home() {
	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans'>
			<main className='container mx-auto px-4 py-8 max-w-4xl'>
				<header className='text-center mb-12'>
					<h1 className='text-5xl font-bold mb-4 text-gray-900 dark:text-white'>
						🎸 Guitar CRM
					</h1>
					<p className='text-xl text-gray-600 dark:text-gray-300 mb-2'>
						Student Management System
					</p>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						Built with Next.js, TypeScript & Supabase
					</p>
				</header>
				
				<div className='space-y-8'>
					<SupabaseTest />
					
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
						<h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
							🚀 Development Ready
						</h2>
						<div className='grid md:grid-cols-2 gap-6'>
							<div>
								<h3 className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200'>
									✅ Project Features
								</h3>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
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
								<h3 className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200'>
									🛠️ Development Scripts
								</h3>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li><code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>npm run setup</code> - Environment setup</li>
									<li><code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>npm run new-feature</code> - Create feature branch</li>
									<li><code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>npm run tdd</code> - Start TDD mode</li>
									<li><code className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm'>npm run quality</code> - Code quality checks</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
