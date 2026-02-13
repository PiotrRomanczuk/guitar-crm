import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface LastLessonCardProps {
  lesson: {
    id: string;
    title: string | null;
    scheduled_at: string;
    notes: string | null;
  } | null;
}

export function LastLessonCard({ lesson }: LastLessonCardProps) {
  if (!lesson) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Last Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No past lessons found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Last Lesson
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg truncate">{lesson.title || 'Untitled Lesson'}</h3>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(lesson.scheduled_at), 'PPP p')}</span>
          </div>
        </div>

        {lesson.notes && (
          <div className="bg-muted/50 p-3 rounded-md text-sm line-clamp-3">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span className="text-xs font-medium uppercase">Notes</span>
            </div>
            {lesson.notes}
          </div>
        )}

        <div className="mt-auto pt-4">
          <Button asChild className="w-full" variant="outline">
            <Link href={`/dashboard/lessons/${lesson.id}`}>View Lesson Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
