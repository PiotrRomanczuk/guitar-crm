import { LessonList } from '@/components/lessons';
import { ProtectedRoute } from '@/components/auth';

export default function LessonsPage() {
	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<LessonList />
			</div>
		</ProtectedRoute>
	);
}
