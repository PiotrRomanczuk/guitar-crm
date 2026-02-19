import { LessonForm } from '@/components/lessons';

export default function NewLessonPage() {
  return (
    <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Lesson</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule a new lesson for a student</p>
        </div>
        <LessonForm />
      </div>
    </main>
  );
}
