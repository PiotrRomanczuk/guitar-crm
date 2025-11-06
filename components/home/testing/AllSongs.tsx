import { supabase } from '@/lib/supabase';

export default async function AllSongs() {
	const { data, error } = await supabase.from('songs').select('*');

	if (error) {
		return <div>Error loading songs: {error.message}</div>;
	}

	return (
		<div>
			<h1>All Songs</h1>
			<ul>
				{data?.map((song) => (
					<li key={song.id}>
						{song.title} by {song.artist}
					</li>
				))}
			</ul>
		</div>
	);
}
