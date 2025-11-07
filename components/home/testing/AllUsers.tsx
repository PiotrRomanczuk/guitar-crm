import { supabase } from '@/lib/supabase';

export default async function AllUsers() {
	const { data, error } = await supabase.from('profiles').select('*');

	if (error) {
		return <div>Error loading users: {error.message}</div>;
	}

	return (
		<div>
			<h1>All Users</h1>
			<ul>
				{data?.map((user) => (
					<li key={user.id}>
						{user.full_name} ({user.email})
					</li>
				))}
			</ul>
		</div>
	);
}
