import { SongDetail } from '@/components/songs';
import { ProtectedRoute } from '@/components/auth';

interface SongPageProps {
	params: {
		id: string;
	};
}

export default function SongPage({ params }: SongPageProps) {
	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<SongDetail songId={params.id} />
			</div>
		</ProtectedRoute>
	);
}
