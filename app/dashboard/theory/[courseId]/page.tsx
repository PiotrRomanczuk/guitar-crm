import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Settings, BookOpen, Eye, EyeOff } from 'lucide-react';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getTheoryCourse, getCourseAccess, getStudentsList } from '../actions';
import { TheoryCourseAccessManager } from '@/components/theory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function TheoryCourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');

  const isStaff = isAdmin || isTeacher;
  const course = await getTheoryCourse(courseId);

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Course Not Found</h1>
        <Link href="/dashboard/theory" className="text-primary hover:underline">
          Back to Theory
        </Link>
      </div>
    );
  }

  const accessList = isStaff ? await getCourseAccess(courseId) : [];
  const students = isStaff ? await getStudentsList() : [];
  const lessons = course.lessons ?? [];
  const visibleLessons = isStaff
    ? lessons
    : lessons.filter((l: { is_published: boolean }) => l.is_published);

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/dashboard/theory" className="hover:underline">
          Theory
        </Link>
        <span className="mx-2">/</span>
        <span>{course.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            {isStaff && (
              course.is_published
                ? <Badge variant="default" className="gap-1"><Eye className="size-3" /> Published</Badge>
                : <Badge variant="secondary" className="gap-1"><EyeOff className="size-3" /> Draft</Badge>
            )}
          </div>
          {course.description && (
            <p className="text-muted-foreground">{course.description}</p>
          )}
        </div>
        {isStaff && (
          <div className="flex gap-2 shrink-0">
            <Link href={`/dashboard/theory/${courseId}/new`}>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Add Chapter
              </Button>
            </Link>
            <Link href={`/dashboard/theory/${courseId}/edit`}>
              <Button size="sm" variant="outline" className="gap-2">
                <Settings className="size-4" />
                Edit
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapters list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="size-5" />
            Chapters ({visibleLessons.length})
          </h2>

          {visibleLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {isStaff ? 'No chapters yet. Add your first one!' : 'Coming soon.'}
            </p>
          ) : (
            <div className="space-y-2">
              {visibleLessons.map((lesson: {
                id: string;
                title: string;
                excerpt: string | null;
                is_published: boolean;
                sort_order: number;
              }, idx: number) => (
                <Link
                  key={lesson.id}
                  href={`/dashboard/theory/${courseId}/${lesson.id}`}
                >
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center gap-4 py-4">
                      <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lesson.title}</p>
                        {lesson.excerpt && (
                          <p className="text-sm text-muted-foreground truncate">
                            {lesson.excerpt}
                          </p>
                        )}
                      </div>
                      {isStaff && !lesson.is_published && (
                        <Badge variant="secondary" className="shrink-0">Draft</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Access management (staff only) */}
        {isStaff && (
          <div className="lg:col-span-1">
            <TheoryCourseAccessManager
              courseId={courseId}
              accessList={accessList}
              students={students}
            />
          </div>
        )}
      </div>
    </div>
  );
}
