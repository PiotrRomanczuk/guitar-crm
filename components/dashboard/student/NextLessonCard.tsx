import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
    <Card className="col-span-full bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20">
      <CardHeader>
        <CardTitle className="text-foreground">Next Lesson</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 w-full md:w-auto">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {lesson.title || 'Guitar Lesson'}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{format(new Date(lesson.scheduled_at), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{format(new Date(lesson.scheduled_at), 'h:mm a')}</span>
                </div>
              </div>
            </div>
          </div>

          <Button asChild className="w-full md:w-auto shadow-md">
            <Link href={`/dashboard/lessons/${lesson.id}`}>
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
