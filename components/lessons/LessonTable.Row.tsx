import Link from 'next/link';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { formatDate, formatTime, getStatusColor } from './LessonTable.helpers';

interface Props {
	lesson: LessonWithProfiles;
	showTeacherColumn: boolean;
	showActions: boolean;
	baseUrl: string;
}

export default function LessonTableRow({
	lesson,
	showTeacherColumn,
	showActions,
	baseUrl,
}: Props) {
	return (
		<tr className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
			<td className='border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100'>
				{lesson.profile
					? `${lesson.profile.firstName || ''} ${
							lesson.profile.lastName || ''
					  }`.trim() || lesson.profile.email
					: 'Unknown Student'}
			</td>
			{showTeacherColumn && (
				<td className='border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100'>
					{lesson.teacher_profile
						? `${lesson.teacher_profile.firstName || ''} ${
								lesson.teacher_profile.lastName || ''
						  }`.trim() || lesson.teacher_profile.email
						: 'Unknown Teacher'}
				</td>
			)}
			<td className='border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100'>
				{formatDate(lesson.date)}
			</td>
			<td className='border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100'>
				{formatTime(lesson.start_time)}
			</td>
			<td className='border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100'>
				<Link
					href={`${baseUrl}/${lesson.id}`}
					className='text-blue-600 dark:text-blue-400 hover:underline font-medium'
				>
					{lesson.title || 'Untitled Lesson'}
				</Link>
			</td>
			<td className='border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2'>
				<span
					className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
						lesson.status
					)}`}
				>
					{lesson.status || 'SCHEDULED'}
				</span>
			</td>
			{showActions && (
				<td className='border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2'>
					<div className='flex gap-2'>
						<Link
							href={`${baseUrl}/${lesson.id}`}
							className='text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm'
						>
							View
						</Link>
					</div>
				</td>
			)}
		</tr>
	);
}
