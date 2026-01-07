import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SyncResult {
  total: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: string[];
}

interface SyncResultCardProps {
  result: SyncResult;
}

export function SyncResultCard({ result }: SyncResultCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Sync Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Total Processed</div>
            <div className="text-2xl font-bold">{result.total}</div>
          </div>
          <div className="bg-card rounded-lg p-3 border border-green-200">
            <div className="text-xs text-muted-foreground">Updated</div>
            <div className="text-2xl font-bold text-green-600">{result.updated}</div>
          </div>
          <div className="bg-card rounded-lg p-3 border border-orange-200">
            <div className="text-xs text-muted-foreground">Skipped</div>
            <div className="text-2xl font-bold text-orange-600">{result.skipped}</div>
          </div>
          <div className="bg-card rounded-lg p-3 border border-red-200">
            <div className="text-xs text-muted-foreground">Failed</div>
            <div className="text-2xl font-bold text-red-600">{result.failed}</div>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Errors ({result.errors.length})
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground max-h-48 overflow-y-auto">
              {result.errors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
