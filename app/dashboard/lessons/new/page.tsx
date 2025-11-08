import { LessonForm } from '@/components/lessons';

export default function NewLessonPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Create New Lesson
        </h1>
        <LessonForm />
      </div>
    </div>
  );
}
