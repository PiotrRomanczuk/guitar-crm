import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

interface LessonListHeaderProps {
  role?: 'admin' | 'teacher' | 'student';
}

export default function LessonListHeader({ role = 'admin' }: LessonListHeaderProps) {
  const canEdit = role === 'admin' || role === 'teacher';

  return (
    <div className="flex items-center justify-between opacity-0 animate-fade-in">
      <div className="space-y-1">
        <h1 data-testid="page-title" className="text-3xl font-bold tracking-tight">
          Lessons
        </h1>
        <p className="text-muted-foreground">Manage your lessons and schedule</p>
      </div>
      {canEdit && (
        <div className="flex gap-2">
          <Link href="/dashboard/lessons/import">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Import
            </Button>
          </Link>
          <Link href="/dashboard/lessons/new">
            <Button className="gap-2" data-testid="create-lesson-button">
              <Plus className="w-4 h-4" />
              Create New Lesson
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
