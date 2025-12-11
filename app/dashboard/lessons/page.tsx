import { LessonList } from '@/components/lessons';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';
import { getLessonsHandler } from '@/app/api/lessons/handlers';
import { LessonWithProfiles } from '@/schemas/LessonSchema';

interface LessonsPageData {
  lessons: LessonWithProfiles[];
  error: string | null;
}

interface LessonsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function fetchInitialLessons(
  filter?: string,
  studentId?: string
): Promise<LessonsPageData> {
  try {
    const supabase = await createClient();
    const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

    const profile = {
      isAdmin,
      isTeacher,
      isStudent,
    };

    // Use the same handler as the API route
    const result = await getLessonsHandler(supabase, user, profile, {
      filter,
      studentId,
    });

    if (result.error) {
      return { lessons: [], error: result.error };
    }

    return { lessons: (result.lessons as LessonWithProfiles[]) || [], error: null };
  } catch (err) {
    return {
      lessons: [],
      error: err instanceof Error ? err.message : 'Failed to load lessons',
    };
  }
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const { user } = await getUserWithRolesSSR();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const filter = typeof resolvedParams.filter === 'string' ? resolvedParams.filter : undefined;
  const studentId =
    typeof resolvedParams.studentId === 'string' ? resolvedParams.studentId : undefined;

  const { lessons, error } = await fetchInitialLessons(filter, studentId);

  return (
    <div className="container mx-auto px-4 py-8">
      <LessonList initialLessons={lessons} initialError={error} />
    </div>
  );
}
