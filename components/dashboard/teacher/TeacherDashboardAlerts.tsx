import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'info' | 'urgent';
  message: string;
  actionLabel: string;
  actionHref: string;
  icon: LucideIcon;
}

interface TeacherDashboardAlertsProps {
  alerts: DashboardAlert[];
}

const borderColorMap: Record<DashboardAlert['type'], string> = {
  urgent: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
};

const iconColorMap: Record<DashboardAlert['type'], string> = {
  urgent: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

/**
 * Actionable alerts section for the teacher dashboard.
 * Renders up to 3 alerts with severity-colored left border.
 * Returns null when there are no alerts.
 */
export function TeacherDashboardAlerts({ alerts }: TeacherDashboardAlertsProps) {
  if (alerts.length === 0) return null;

  const visibleAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <Card
            key={alert.id}
            className={cn(
              'border-l-4 py-3',
              borderColorMap[alert.type],
            )}
          >
            <CardContent className="flex items-center justify-between gap-3 px-4 py-0">
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn('h-5 w-5 shrink-0', iconColorMap[alert.type])}
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground truncate">{alert.message}</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="shrink-0">
                <Link href={alert.actionHref}>{alert.actionLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
