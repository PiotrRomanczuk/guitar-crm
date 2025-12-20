import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface NextLessonCardProps {
  lesson: {
    id: string;
    title: string | null;
    scheduled_at: string;
  } | null;
}

export function NextLessonCard({ lesson }: NextLessonCardProps) {
  if (!lesson) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Next Lesson</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="relative w-64 h-48 mb-4">
            <Image
              src="/illustrations/no-upcoming-lessons--future-focused---a-forward-lo.png"
              alt="No upcoming lessons"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-muted-foreground text-center">
            No upcoming lessons scheduled. Keep practicing!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-blue-900 dark:text-blue-100">Next Lesson</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              {lesson.title || 'Guitar Lesson'}
            </h3>
            <div className="flex items-center gap-4 text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(lesson.scheduled_at), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{format(new Date(lesson.scheduled_at), 'h:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
