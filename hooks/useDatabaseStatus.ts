/**
 * useDatabaseStatus Hook
 *
 * React hook for accessing database connection status in client components.
 * Provides real-time information about which database (local/remote) the
 * application is currently connected to.
 *
 * Usage:
 * ```tsx
 * const { isLocal, type, isLoading, toggleDatabase, testConnection } = useDatabaseStatus();
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export type DatabaseType = 'local' | 'remote';

export interface DatabaseStatusState {
  type: DatabaseType;
  url: string;
  isLocal: boolean;
  source: 'cookie' | 'header' | 'default';
  localAvailable: boolean;
  remoteAvailable: boolean;
  isConnected: boolean;
  latency?: number;
  error?: string;
}

export interface UseDatabaseStatusReturn {
  /** Current database type */
  type: DatabaseType;
  /** Whether connected to local database */
  isLocal: boolean;
  /** Full database status */
  status: DatabaseStatusState | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: string | null;
  /** Toggle between local and remote */
  toggleDatabase: () => void;
  /** Switch to specific database type */
  switchTo: (type: DatabaseType) => void;
  /** Test the current connection */
  testConnection: () => Promise<boolean>;
  /** Refresh status */
  refresh: () => Promise<void>;
}

const COOKIE_NAME = 'sb-provider-preference';
const COOKIE_MAX_AGE = 31536000; // 1 year

/**
 * Get current database preference from cookie
 */
function getPreferenceFromCookie(): DatabaseType {
  if (typeof document === 'undefined') return 'local';

  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  return match && match[2] === 'remote' ? 'remote' : 'local';
}

/**
 * Set database preference cookie
 */
function setPreferenceCookie(type: DatabaseType): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${COOKIE_NAME}=${type}; path=/; max-age=${COOKIE_MAX_AGE}`;
}

/**
 * Hook for accessing and managing database connection status
 */
export function useDatabaseStatus(): UseDatabaseStatusReturn {
  const [status, setStatus] = useState<DatabaseStatusState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch status from API
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/database/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch database status: ${response.statusText}`);
      }

      const data = await response.json();

      setStatus({
        type: data.database.type,
        url: data.database.url,
        isLocal: data.database.isLocal,
        source: data.database.source,
        localAvailable: data.availability.localAvailable,
        remoteAvailable: data.availability.remoteAvailable,
        isConnected: data.success,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Fallback to cookie-based detection
      const cookiePref = getPreferenceFromCookie();
      setStatus({
        type: cookiePref,
        url: '',
        isLocal: cookiePref === 'local',
        source: 'cookie',
        localAvailable: !!process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL,
        remoteAvailable: !!(
          process.env.NEXT_PUBLIC_SUPABASE_REMOTE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
        ),
        isConnected: false,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/database/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      setStatus((prev) => ({
        ...prev!,
        isConnected: data.connection?.isConnected ?? false,
        latency: data.connection?.latency,
        error: data.connection?.error,
      }));

      return data.connection?.isConnected ?? false;
    } catch {
      return false;
    }
  }, []);

  // Toggle database
  const toggleDatabase = useCallback(() => {
    const current = status?.type ?? getPreferenceFromCookie();
    const newType: DatabaseType = current === 'local' ? 'remote' : 'local';

    // Check if switch is possible
    if (newType === 'local' && !status?.localAvailable) {
      setError('Local database configuration not available');
      return;
    }
    if (newType === 'remote' && !status?.remoteAvailable) {
      setError('Remote database configuration not available');
      return;
    }

    setPreferenceCookie(newType);

    // Reload to apply changes
    window.location.reload();
  }, [status]);

  // Switch to specific database
  const switchTo = useCallback(
    (type: DatabaseType) => {
      if (type === 'local' && !status?.localAvailable) {
        setError('Local database configuration not available');
        return;
      }
      if (type === 'remote' && !status?.remoteAvailable) {
        setError('Remote database configuration not available');
        return;
      }

      if (status?.type === type) {
        return; // Already on requested database
      }

      setPreferenceCookie(type);
      window.location.reload();
    },
    [status]
  );

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    type: status?.type ?? 'local',
    isLocal: status?.isLocal ?? true,
    status,
    isLoading,
    error,
    toggleDatabase,
    switchTo,
    testConnection,
    refresh: fetchStatus,
  };
}

export default useDatabaseStatus;
