'use client';

import Link from 'next/link';

interface Lesson {
  id: string;
  lesson_teacher_number: number | null;
  lesson_number: number | null;
  date: string | null;
  status: string | null;
  student: { full_name: string } | null;
  teacher: { full_name: string } | null;
}

interface UserLessonsProps {
  lessons: Lesson[] | null;
}

function getStatusColor(status: string | null): string {
  if (status === 'COMPLETED') {
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
  }
  if (status === 'SCHEDULED') {
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
}

export default function UserLessons({ lessons }: UserLessonsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            📚 Lessons
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {lessons?.length || 0} total lesson{lessons?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Lessons List */}
      {lessons && lessons.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/dashboard/lessons/${lesson.id}`}
              className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                    📖 Lesson #{lesson.lesson_teacher_number || lesson.lesson_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    📅{' '}
                    {lesson.date
                      ? new Date(lesson.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'No date set'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md">
                      👨‍🎓 {lesson.student?.full_name || 'Unknown'}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md">
                      👨‍🏫 {lesson.teacher?.full_name || 'Unknown'}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${getStatusColor(
                    lesson.status
                  )}`}
                >
                  {lesson.status || 'UNKNOWN'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">📭 No lessons found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Lessons will appear here once created
          </p>
        </div>
      )}
    </div>
  );
}
