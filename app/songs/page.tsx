import { SongList } from '@/components/songs';
import { ProtectedRoute } from '@/components/auth';

export default function SongsPage() {
	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<SongList />
			</div>
		</ProtectedRoute>
	);
}
