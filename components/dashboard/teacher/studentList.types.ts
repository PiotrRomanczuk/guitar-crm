export interface Student {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonsCompleted: number;
  nextLesson: string;
  avatar?: string;
}

export interface StudentListProps {
  students: Student[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const levelColors = {
  Beginner: 'bg-primary/10 text-primary border-0',
  Intermediate: 'bg-warning/10 text-warning border-0',
  Advanced: 'bg-success/10 text-success border-0',
};

export const ITEMS_PER_PAGE = 5;
