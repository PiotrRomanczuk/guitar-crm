import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function LessonListHeader() {
  return (
    <div className="flex items-center justify-between opacity-0 animate-fade-in">
      <div className="space-y-1">
        <h1 data-testid="page-title" className="text-3xl font-bold tracking-tight">
          Lessons
        </h1>
        <p className="text-muted-foreground">Manage your lessons and schedule</p>
      </div>
      <Link href="/dashboard/lessons/new">
        <Button className="gap-2" data-testid="create-lesson-button">
          <Plus className="w-4 h-4" />
          Create New Lesson
        </Button>
      </Link>
    </div>
  );
}
