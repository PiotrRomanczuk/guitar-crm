import SupabaseTest from '@/components/SupabaseTest';

export default function Home() {
	return (
		<div className='min-h-screen bg-zinc-50 font-sans dark:bg-black'>
			<main className='container mx-auto py-8'>
				<h1 className='text-4xl font-bold text-center mb-8 text-black dark:text-zinc-50'>
					Guitar CRM - Students Manager
				</h1>
				<SupabaseTest />
			</main>
		</div>
	);
}
