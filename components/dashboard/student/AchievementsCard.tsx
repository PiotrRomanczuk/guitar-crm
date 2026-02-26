import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Guitar, Library, Star, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  title: string;
  description: string;
  icon: React.ElementType;
  isCompleted: boolean;
}

interface AchievementsCardProps {
  completedLessons: number;
  totalSongs: number;
  assignmentCompletionRate: number;
  recentLessons: Array<{
    scheduled_at: string;
  }>;
}

function getWeeksWithLessons(
  recentLessons: AchievementsCardProps['recentLessons']
): number {
  const now = new Date();
  const weekFlags = [false, false, false, false];

  for (const lesson of recentLessons) {
    const lessonDate = new Date(lesson.scheduled_at);
    const diffMs = now.getTime() - lessonDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays < 28) {
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex < 4) {
        weekFlags[weekIndex] = true;
      }
    }
  }

  return weekFlags.filter(Boolean).length;
}

function buildAchievements(props: AchievementsCardProps): Achievement[] {
  const weeksWithLessons = getWeeksWithLessons(props.recentLessons);

  return [
    {
      title: 'First Strum',
      description:
        props.completedLessons > 0
          ? 'Completed!'
          : 'Complete your first lesson',
      icon: Guitar,
      isCompleted: props.completedLessons > 0,
    },
    {
      title: 'Song Collector',
      description:
        props.totalSongs >= 10
          ? 'Completed!'
          : `${props.totalSongs}/10 songs`,
      icon: Library,
      isCompleted: props.totalSongs >= 10,
    },
    {
      title: 'Star Student',
      description:
        props.assignmentCompletionRate === 100
          ? 'Completed!'
          : `${props.assignmentCompletionRate}% completion`,
      icon: Star,
      isCompleted: props.assignmentCompletionRate === 100,
    },
    {
      title: 'Practice Regular',
      description:
        weeksWithLessons >= 3
          ? 'Completed!'
          : `${weeksWithLessons}/3 weeks active`,
      icon: CalendarCheck,
      isCompleted: weeksWithLessons >= 3,
    },
  ];
}

export function AchievementsCard(props: AchievementsCardProps) {
  const achievements = buildAchievements(props);

  return (
    <Card
      className="mt-8 opacity-0 animate-fade-in"
      style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <AchievementItem key={achievement.title} {...achievement} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementItem({ title, description, icon: Icon, isCompleted }: Achievement) {
  return (
    <div
      className={cn(
        'relative text-center p-4 rounded-lg transition-colors',
        isCompleted
          ? 'bg-primary/5 dark:bg-primary/10'
          : 'bg-muted/50 dark:bg-muted/30'
      )}
    >
      {isCompleted && (
        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
      )}
      <div
        className={cn(
          'mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full',
          isCompleted
            ? 'bg-primary/10 dark:bg-primary/20'
            : 'bg-muted dark:bg-muted/50'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5',
            isCompleted ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      </div>
      <p
        className={cn(
          'font-medium',
          isCompleted ? 'text-primary' : 'text-foreground'
        )}
      >
        {title}
      </p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
