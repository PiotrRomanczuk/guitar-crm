'use client';

interface LogsPageClientProps {
  isAdmin?: boolean;
}

export function LogsPageClient({ isAdmin }: LogsPageClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Logs</h1>
        <p className="text-muted-foreground mt-2">
          {isAdmin ? 'View all system activity and events' : 'View your activity logs'}
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Logs coming soon...</p>
      </div>
    </div>
  );
}
