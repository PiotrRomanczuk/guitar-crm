import AllSongs from '../home/testing/AllSongs';
import AllUsers from '../home/testing/AllUsers';
// import SupabaseTest from '../SupabaseTest'; // Unused - for future testing
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { LandingHeader } from './LandingHeader';

export function LandingPage() {
	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans'>
			<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl'>
				<LandingHeader />

				<div className='space-y-6 sm:space-y-8'>
					{/* <SupabaseTest /> */}
					<AllUsers />
					<AllSongs />

					<FeaturesSection />
					<TestimonialsSection />
				</div>
			</main>
		</div>
	);
}
