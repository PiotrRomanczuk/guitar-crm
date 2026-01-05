'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, User, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface StudentLessonView {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  teacher: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
}

export function StudentLessonsPageClient() {
  const [lessons, setLessons] = useState<StudentLessonView[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLessons() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('lessons')
          .select(
            `
            id,
            title,
            scheduled_at,
            duration_minutes,
            status,
            notes,
            teacher:teacher_id (
              id,
              first_name,
              last_name
            )
          `
          )
          .eq('student_id', user.id)
          .order('scheduled_at', { ascending: false });

        if (error) throw error;

        setLessons(data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div
        className="mb-6 sm:mb-8 opacity-0 animate-fade-in"
        style={{ animationFillMode: 'forwards' }}
      >
        <h1 className="text-2xl sm:text-3xl font-semibold">
          <span className="text-primary">Lessons</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          View and manage all scheduled lessons
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative w-64 h-48 mx-auto mb-6">
            <img
              src="/illustrations/no-upcoming-lessons--future-focused---a-forward-lo.png"
              alt="No lessons scheduled"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-medium mb-2">No lessons scheduled</h3>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have any lessons scheduled yet. Your teacher will schedule lessons as you
            begin your guitar journey.
          </p>
          <p className="text-sm text-muted-foreground">
            Ready to start? Contact your teacher to schedule your first lesson.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {lessons.map((lesson, index) => {
            return (
              <div
                key={lesson.id}
                className="bg-card rounded-xl border border-border p-4 sm:p-6 hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {lesson.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(lesson.scheduled_at), 'MMM d, yyyy')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(lesson.scheduled_at), 'h:mm a')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {lesson.duration_minutes} min
                            </Badge>
                            <Badge
                              variant={lesson.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {lesson.status === 'completed' ? 'Completed' : 'Scheduled'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1 gap-2">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">
                            Teacher: {lesson.teacher?.[0]?.first_name}{' '}
                            {lesson.teacher?.[0]?.last_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {lesson.notes && (
                      <div className="hidden md:block md:max-w-xs lg:max-w-md bg-secondary/30 rounded-lg p-3 text-sm truncate">
                        <p className="text-muted-foreground italic truncate">
                          &quot;{lesson.notes}&quot;
                        </p>
                      </div>
                    )}

                    <Button asChild variant="ghost" size="sm" className="ml-auto w-full md:w-auto">
                      <Link href={`/dashboard/lessons/${lesson.id}`}>
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
