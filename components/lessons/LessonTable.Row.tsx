import Link from 'next/link';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { formatDate, formatTime, getStatusColor } from './LessonTable.helpers';

interface Props {
  lesson: LessonWithProfiles;
  showTeacherColumn: boolean;
  showActions: boolean;
  baseUrl: string;
}

export default function LessonTableRow({ lesson, showTeacherColumn, showActions, baseUrl }: Props) {
  const songs = lesson.lesson_songs?.map(ls => ls.song?.title).filter(Boolean) || [];
  const assignments = lesson.assignments?.map(a => a.title) || [];
  const hasContent = songs.length > 0 || assignments.length > 0;

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
      data-testid="lesson-row"
    >
      <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100 relative">
        <Link
          href={`${baseUrl}/${lesson.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          data-testid="lesson-title-link"
        >
          {lesson.title || 'Untitled Lesson'}
        </Link>
        
        {hasContent && (
          <div className="absolute left-4 top-full mt-1 z-50 hidden group-hover:block w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            {songs.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Songs</h4>
                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300">
                  {songs.slice(0, 3).map((song, i) => (
                    <li key={i} className="truncate">{song}</li>
                  ))}
                  {songs.length > 3 && <li className="text-gray-500 italic">+{songs.length - 3} more</li>}
                </ul>
              </div>
            )}
            {assignments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assignments</h4>
                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300">
                  {assignments.slice(0, 3).map((assignment, i) => (
                    <li key={i} className="truncate">{assignment}</li>
                  ))}
                  {assignments.length > 3 && <li className="text-gray-500 italic">+{assignments.length - 3} more</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
        {lesson.profile ? lesson.profile.full_name || lesson.profile.email : 'Unknown Student'}
      </td>
      {showTeacherColumn && (
        <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
          {lesson.teacher_profile
            ? lesson.teacher_profile.full_name || lesson.teacher_profile.email
            : 'Unknown Teacher'}
        </td>
      )}
      <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
        {formatDate(lesson.date)}
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
        {formatTime(lesson.start_time)}
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            lesson.status
          )}`}
        >
          {lesson.status || 'SCHEDULED'}
        </span>
      </td>
      {showActions && (
        <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2">
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
        </td>
      )}
    </tr>
  );
}
