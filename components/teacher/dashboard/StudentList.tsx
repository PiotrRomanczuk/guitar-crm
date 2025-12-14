import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonsCompleted: number;
  nextLesson: string;
  avatar?: string;
}

interface StudentListProps {
  students: Student[];
}

const levelColors = {
  Beginner: 'bg-blue-500/10 text-blue-500 border-0',
  Intermediate: 'bg-primary/10 text-primary border-0',
  Advanced: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0',
};

export function StudentList({ students }: StudentListProps) {
  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
    >
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold">Students Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">Your active students this week</p>
      </div>

      <div className="divide-y divide-border">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4"
          >
            <Avatar className="w-10 h-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{student.name}</p>
              <p className="text-sm text-muted-foreground">Next: {student.nextLesson}</p>
            </div>

            <div className="text-right">
              <Badge variant="outline" className={cn('font-medium', levelColors[student.level])}>
                {student.level}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {student.lessonsCompleted} lessons
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
