import { createClient } from '@/lib/supabase/server';

export default async function Page() {
	const supabase = await createClient();

	const { data: profiles, error } = await supabase.from('profiles').select('*');

	if (error) {
		console.error('Error fetching profiles:', error);
		return <div>Error fetching profiles</div>;
	}

	return (
		<div>
			<h1>Debug Fetches Page</h1>
			<pre>{JSON.stringify(profiles, null, 2)}</pre>
		</div>
	);
}
