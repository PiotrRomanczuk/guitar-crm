import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CronJobStatus } from '@/types/health';

interface CronStatusPanelProps {
  crons: CronJobStatus[];
}

export function CronStatusPanel({ crons }: CronStatusPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Cron Jobs ({crons.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {crons.map((cron) => (
            <div key={cron.path} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{cron.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{cron.path}</p>
              </div>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{cron.schedule}</code>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
