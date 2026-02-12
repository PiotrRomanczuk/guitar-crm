import { Music, Clock, CheckCircle2, AlertCircle, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'song_added' | 'assignment_due' | 'assignment_submitted';
  message: string;
  time: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const activityIcons = {
  lesson_completed: { icon: CheckCircle2, color: 'text-green-500 dark:text-green-400' },
  song_added: { icon: Music, color: 'text-primary' },
  assignment_due: { icon: AlertCircle, color: 'text-yellow-500 dark:text-yellow-400' },
  assignment_submitted: { icon: CheckCircle2, color: 'text-green-500 dark:text-green-400' },
};

function RecentActivitySkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full max-w-[200px]" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-card rounded-xl border border-destructive/50 overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-destructive">Error loading activity</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Failed to fetch recent activity. Please try again.
        </p>
      </div>
      <div className="p-6 text-center">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="min-h-[44px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

function RecentActivityEmpty() {
  return (
    <div className="p-8 sm:p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Activity className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Activity from your students will appear here as they complete lessons and assignments.
      </p>
    </div>
  );
}

export function RecentActivity({ activities, isLoading, error, onRetry }: RecentActivityProps) {
  if (isLoading) return <RecentActivitySkeleton />;
  if (error) return <RecentActivityError onRetry={onRetry} />;

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
    >
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest updates from your students</p>
      </div>

      {activities.length === 0 ? (
        <RecentActivityEmpty />
      ) : (
        <div className="p-4 space-y-4" role="list" aria-label="Recent activity feed">
          {activities.map((activity, index) => {
            const { icon: Icon, color } = activityIcons[activity.type];
            return (
              <div
                key={`${activity.id}-${index}`}
                className="flex items-start gap-3 min-h-[44px]"
                role="listitem"
                aria-label={`${activity.message}, ${activity.time}`}
              >
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
      )}
    </div>
  );
}
