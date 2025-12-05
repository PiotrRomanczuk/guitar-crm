interface Props {
  role: 'admin' | 'teacher' | 'student';
}

export default function LessonTableEmpty({ role }: Props) {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-12 text-center border rounded-md bg-muted/10"
    >
      <p className="text-lg font-medium text-foreground">No lessons found</p>
      <p className="text-sm text-muted-foreground mt-1">
        {role === 'student'
          ? "You haven't been scheduled for any lessons yet."
          : 'Create your first lesson to get started.'}
      </p>
    </div>
  );
}
