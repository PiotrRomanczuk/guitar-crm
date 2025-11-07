import { ProtectedRoute } from '@/components/auth';
import SongFormGuard from '@/components/songs/SongFormGuard';

interface EditSongPageProps {
	params: {
		id: string;
	};
}

export default function EditSongPage({ params }: EditSongPageProps) {
	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<SongFormGuard mode='edit' songId={params.id} />
			</div>
		</ProtectedRoute>
	);
}
