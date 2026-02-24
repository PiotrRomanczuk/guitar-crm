'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DebugRefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const AUTO_REFRESH_INTERVAL = 30_000;
const COUNTDOWN_START = AUTO_REFRESH_INTERVAL / 1000;

export function DebugRefreshButton({ onRefresh, isLoading }: DebugRefreshButtonProps) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    intervalRef.current = setInterval(onRefresh, AUTO_REFRESH_INTERVAL);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? COUNTDOWN_START : c - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefresh, onRefresh]);

  const handleToggleAutoRefresh = () => {
    if (!autoRefresh) {
      setCountdown(COUNTDOWN_START);
    }
    setAutoRefresh((v) => !v);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="gap-2">
        <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        Refresh
      </Button>
      <Button
        variant={autoRefresh ? 'secondary' : 'ghost'}
        size="sm"
        onClick={handleToggleAutoRefresh}
        className="gap-1 text-xs"
      >
        {autoRefresh ? `Auto (${countdown}s)` : 'Auto-refresh'}
      </Button>
    </div>
  );
}
