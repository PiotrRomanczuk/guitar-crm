import Image from 'next/image';

interface Props {
  role: 'admin' | 'teacher' | 'student';
}

export default function LessonTableEmpty({ role }: Props) {
  const isStudent = role === 'student';
  const imageSrc = isStudent
    ? '/illustrations/no-lessons-scheduled--a-motivational-empty-state-i.png'
    : '/illustrations/all-lessons-scheduled--a-triumphant-empty-state-il.png';
  
  const altText = isStudent ? 'No lessons scheduled' : 'All lessons scheduled';

  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-12 text-center border rounded-md bg-muted/10"
    >
      <div className="relative w-64 h-48 mb-6">
        <Image
          src={imageSrc}
          alt={altText}
          fill
          className="object-contain"
        />
      </div>
      <p className="text-lg font-medium text-foreground">No lessons found</p>
      <p className="text-sm text-muted-foreground mt-1">
        {isStudent
          ? "You haven't been scheduled for any lessons yet."
          : 'Create your first lesson to get started.'}
      </p>
    </div>
  );
}
