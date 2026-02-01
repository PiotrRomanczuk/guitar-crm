'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import LessonListHeader from './LessonList.Header';
import LessonTable from './LessonTable';
import LessonListFilter from './LessonList.Filter';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LessonListClientProps {
  initialLessons: LessonWithProfiles[];
  role: 'admin' | 'teacher' | 'student';
  students?: { id: string; full_name: string | null; email: string }[];
  teachers?: { id: string; full_name: string | null; email: string }[];
  selectedStudentId?: string;
}

export function LessonListClient({
  initialLessons,
  role,
  students,
  teachers,
}: LessonListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we should show success message
  const showSuccess = searchParams.get('created') === 'true';

  const handleDeleteSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="border-success/20 bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Lesson created successfully!</AlertDescription>
        </Alert>
      )}

      <LessonListHeader role={role} />

      <LessonListFilter
        students={students || []}
        teachers={teachers}
        showStudentFilter={role === 'admin' || role === 'teacher'}
        showTeacherFilter={role === 'admin'}
      />

      <LessonTable
        lessons={initialLessons}
        role={role}
        baseUrl="/dashboard/lessons"
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
