/**
 * Backend Database Indicator
 *
 * Server component that displays the current database connection status.
 * Unlike the frontend DatabaseStatus component, this one is server-rendered
 * and gets its information from the server-side database context.
 *
 * Usage:
 * ```tsx
 * import { BackendDatabaseIndicator } from '@/components/debug/BackendDatabaseIndicator';
 *
 * export default async function Page() {
 *   return (
 *     <div>
 *       <BackendDatabaseIndicator />
 *       {/* rest of your page *\/}
 *     </div>
 *   );
 * }
 * ```
 */

import { detectDatabasePreferenceFromCookies } from '@/lib/database/middleware';
import { Badge } from '@/components/ui/badge';
import { Server, Laptop, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackendDatabaseIndicatorProps {
  className?: string;
  showUrl?: boolean;
  variant?: 'badge' | 'minimal' | 'detailed';
}

export async function BackendDatabaseIndicator({
  className,
  showUrl = false,
  variant = 'badge',
}: BackendDatabaseIndicatorProps) {
  let dbInfo;

  try {
    dbInfo = await detectDatabasePreferenceFromCookies();
  } catch {
    // Error state
    return (
      <Badge
        variant="outline"
        className={cn('bg-red-500/10 border-red-500/50 text-red-500 px-2 py-1', className)}
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        <span className="text-xs font-medium">DB Error</span>
      </Badge>
    );
  }

  const isLocal = dbInfo.actualType === 'local';
  const Icon = isLocal ? Laptop : Server;

  if (variant === 'minimal') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs',
          isLocal ? 'text-blue-500' : 'text-orange-500',
          className
        )}
        title={`Connected to ${isLocal ? 'local' : 'remote'} database`}
      >
        <Icon className="w-3 h-3" />
        {isLocal ? 'Local' : 'Remote'}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          'rounded-lg border p-3',
          isLocal ? 'bg-blue-500/5 border-blue-500/20' : 'bg-orange-500/5 border-orange-500/20',
          className
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('w-4 h-4', isLocal ? 'text-blue-500' : 'text-orange-500')} />
          <span className={cn('font-medium', isLocal ? 'text-blue-500' : 'text-orange-500')}>
            {isLocal ? 'Local Database' : 'Remote Database'}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <dt>Type:</dt>
          <dd className="font-mono">{dbInfo.actualType}</dd>
          <dt>Source:</dt>
          <dd className="font-mono">{dbInfo.source}</dd>
          {showUrl && (
            <>
              <dt>URL:</dt>
              <dd className="font-mono truncate">{dbInfo.url}</dd>
            </>
          )}
        </dl>
      </div>
    );
  }

  // Default badge variant
  return (
    <Badge
      variant="outline"
      className={cn(
        'px-2 py-1',
        isLocal
          ? 'bg-blue-500/10 border-blue-500/50 text-blue-500'
          : 'bg-orange-500/10 border-orange-500/50 text-orange-500',
        className
      )}
    >
      <Icon className="w-3 h-3 mr-1" />
      <span className="text-xs font-medium">{isLocal ? 'Local' : 'Remote'}</span>
      {showUrl && (
        <span className="ml-1 text-xs opacity-70 font-mono truncate max-w-25">
          {new URL(dbInfo.url).host}
        </span>
      )}
    </Badge>
  );
}

/**
 * Simple wrapper for getting just the database type without rendering
 */
export async function getDatabaseTypeServer(): Promise<'local' | 'remote'> {
  try {
    const dbInfo = await detectDatabasePreferenceFromCookies();
    return dbInfo.actualType;
  } catch {
    return 'local'; // Default to local on error
  }
}
