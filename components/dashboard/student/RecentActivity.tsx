import { Music, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'lesson_completed' | 'song_added' | 'assignment_due' | 'assignment_submitted';
  message: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  lesson_completed: { icon: CheckCircle2, color: 'text-green-500' },
  song_added: { icon: Music, color: 'text-primary' },
  assignment_due: { icon: AlertCircle, color: 'text-yellow-500' },
  assignment_submitted: { icon: CheckCircle2, color: 'text-green-500' },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
    >
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest updates from your students</p>
      </div>

      <div className="p-4 space-y-4">
        {activities.map((activity, index) => {
          const { icon: Icon, color } = activityIcons[activity.type];
          return (
            <div key={`${activity.id}-${index}`} className="flex items-start gap-3">
              <div className={cn('mt-0.5', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
