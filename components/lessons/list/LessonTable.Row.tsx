import Link from 'next/link';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { formatDate, formatTime, getStatusColor } from './LessonTable.helpers';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface Props {
  lesson: LessonWithProfiles;
  showTeacherColumn: boolean;
  showActions: boolean;
  baseUrl: string;
}

export default function LessonTableRow({ lesson, showTeacherColumn, showActions, baseUrl }: Props) {
  const songs = lesson.lesson_songs?.map((ls) => ls.song?.title).filter(Boolean) || [];
  const assignments = lesson.assignments?.map((a) => a.title) || [];
  const hasContent = songs.length > 0 || assignments.length > 0;

  // Use date if available, otherwise fall back to scheduled_at
  // @ts-expect-error - scheduled_at might not be in the schema yet but is in DB
  const displayDate = lesson.date || lesson.scheduled_at;
  // @ts-expect-error - scheduled_at might not be in the schema yet but is in DB
  const displayTime = lesson.start_time || lesson.scheduled_at;

  return (
    <TableRow
      className="group hover:bg-secondary/50 border-border transition-colors"
      data-testid="lesson-row"
    >
      <TableCell className="relative font-medium">
        <Link
          href={`${baseUrl}/${lesson.id}`}
          className="text-foreground hover:text-primary transition-colors"
          data-testid="lesson-title-link"
        >
          {lesson.title || 'Untitled Lesson'}
        </Link>

        {hasContent && (
          <div className="absolute left-4 top-full mt-1 z-50 hidden group-hover:block w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            {songs.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Songs
                </h4>
                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300">
                  {songs.slice(0, 3).map((song, i) => (
                    <li key={i} className="truncate">
                      {song}
                    </li>
                  ))}
                  {songs.length > 3 && (
                    <li className="text-gray-500 italic">+{songs.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
            {assignments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Assignments
                </h4>
                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300">
                  {assignments.slice(0, 3).map((assignment, i) => (
                    <li key={i} className="truncate">
                      {assignment}
                    </li>
                  ))}
                  {assignments.length > 3 && (
                    <li className="text-gray-500 italic">+{assignments.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        {lesson.profile ? lesson.profile.full_name || lesson.profile.email : 'Unknown Student'}
      </TableCell>
      {showTeacherColumn && (
        <TableCell>
          {lesson.teacher_profile
            ? lesson.teacher_profile.full_name || lesson.teacher_profile.email
            : 'Unknown Teacher'}
        </TableCell>
      )}
      <TableCell>{formatDate(displayDate)}</TableCell>
      <TableCell>{formatTime(displayTime)}</TableCell>
      <TableCell>
        <Badge variant="outline" className={`font-medium ${getStatusColor(lesson.status)}`}>
          {lesson.status || 'SCHEDULED'}
        </Badge>
      </TableCell>
      {showActions && (
        <TableCell>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${baseUrl}/${lesson.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
