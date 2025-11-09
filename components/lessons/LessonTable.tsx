'use client';

import { LessonWithProfiles } from '@/schemas/LessonSchema';
import LessonTableRow from './LessonTable.Row';
import LessonTableEmpty from './LessonTable.Empty';

interface Props {
  lessons: LessonWithProfiles[];
  role: 'admin' | 'teacher' | 'student';
  baseUrl?: string; // e.g., '/lessons', '/teacher/lessons', '/student/lessons'
}

export default function LessonTable({ lessons, role, baseUrl = '/lessons' }: Props) {
  // Show actions column for admin and teacher only
  const showActions = role === 'admin' || role === 'teacher';

  // Show teacher column for admin and student (not for teacher viewing their own lessons)
  const showTeacherColumn = role === 'admin' || role === 'student';

  if (lessons.length === 0) {
    return <LessonTableEmpty role={role} />;
  }

  return (
    <div className="overflow-x-auto" data-testid="lesson-table">
      <table className="w-full min-w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
              Student
            </th>
            {showTeacherColumn && (
              <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Teacher
              </th>
            )}
            <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
              Date
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
              Time
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
              Title
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
              Status
            </th>
            {showActions && (
              <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <LessonTableRow
              key={lesson.id}
              lesson={lesson}
              showTeacherColumn={showTeacherColumn}
              showActions={showActions}
              baseUrl={baseUrl}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
