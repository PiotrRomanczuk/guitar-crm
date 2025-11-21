import Link from 'next/link';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { formatDate, formatTime, getStatusColor } from './LessonTable.helpers';
import { TableCell, TableRow } from '@/components/ui/table';

interface Props {
  lesson: LessonWithProfiles;
  showTeacherColumn: boolean;
  showActions: boolean;
  baseUrl: string;
}

export default function LessonTableRow({ lesson, showTeacherColumn, showActions, baseUrl }: Props) {
  return (
    <TableRow
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      data-testid="lesson-row"
    >
      <TableCell className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
        {lesson.profile ? lesson.profile.full_name || lesson.profile.email : 'Unknown Student'}
      </TableCell>
      {showTeacherColumn && (
        <TableCell className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
          {lesson.teacher_profile
            ? lesson.teacher_profile.full_name || lesson.teacher_profile.email
            : 'Unknown Teacher'}
        </TableCell>
      )}
      <TableCell className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
        {formatDate(lesson.date)}
      </TableCell>
      <TableCell className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
        {formatTime(lesson.start_time)}
      </TableCell>
      <TableCell className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
        <Link
          href={`${baseUrl}/${lesson.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          data-testid="lesson-title-link"
        >
          {lesson.title || 'Untitled Lesson'}
        </Link>
      </TableCell>
      <TableCell className="px-3 sm:px-4 py-2">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            lesson.status
          )}`}
        >
          {lesson.status || 'SCHEDULED'}
        </span>
      </TableCell>
      {showActions && (
        <TableCell className="px-3 sm:px-4 py-2">
          <div className="flex gap-2">
            <Link
              href={`${baseUrl}/${lesson.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm"
              data-testid="lesson-view-button"
            >
              View
            </Link>
            <Link
              href={`${baseUrl}/${lesson.id}/edit`}
              className="text-yellow-600 dark:text-yellow-400 hover:underline text-xs sm:text-sm"
              data-testid="lesson-edit-button"
            >
              Edit
            </Link>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
