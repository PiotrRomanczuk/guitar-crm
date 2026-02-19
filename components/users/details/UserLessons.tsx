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
    return 'bg-success/10 text-success';
  }
  if (status === 'SCHEDULED') {
    return 'bg-primary/10 text-primary';
  }
  return 'bg-muted text-muted-foreground';
}

export default function UserLessons({ lessons }: UserLessonsProps) {
  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Lessons
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
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
              className="block p-4 border-2 border-border rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 bg-card"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-base sm:text-lg">
                    Lesson #{lesson.lesson_teacher_number || lesson.lesson_number || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
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
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                      Student: {lesson.student?.full_name || 'Unknown'}
                    </span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                      Teacher: {lesson.teacher?.full_name || 'Unknown'}
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
          <p className="text-muted-foreground text-lg">No lessons found</p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Lessons will appear here once created
          </p>
        </div>
      )}
    </div>
  );
}
