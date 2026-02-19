'use client';

import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  showStudentColumn?: boolean;
}

function getStatusColor(status: string | null): string {
  if (status === 'COMPLETED') {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
  }
  if (status === 'SCHEDULED') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
}

export default function UserLessons({ lessons, showStudentColumn = true }: UserLessonsProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Lessons List */}
      {lessons && lessons.length > 0 ? (
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/dashboard/lessons/${lesson.id}`}
                className="block p-4 hover:bg-muted/50 transition-colors"
                title={`View Lesson #${lesson.lesson_teacher_number || lesson.lesson_number}`}
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-bold shrink-0">
                        #{lesson.lesson_teacher_number || lesson.lesson_number || '?'}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">
                          {lesson.date
                            ? new Date(lesson.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                            : 'No date set'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                          {showStudentColumn && (
                            <span className="flex items-center gap-1">
                              👨‍🎓 {lesson.student?.full_name || 'Unknown'}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            👨‍🏫 {lesson.teacher?.full_name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide shrink-0 ${getStatusColor(
                      lesson.status
                    )}`}
                  >
                    {lesson.status || 'UNKNOWN'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📚</span>
          </div>
          <p className="text-foreground font-medium">No lessons yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Scheduled lessons will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
