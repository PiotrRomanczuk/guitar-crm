'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, RefreshCw, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { HealthResponse, ServiceStatus } from '@/types/health';

const STATUS_COLORS: Record<ServiceStatus, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-yellow-500',
  error: 'bg-red-500',
  unconfigured: 'bg-gray-300 dark:bg-gray-600',
};

const STATUS_RING: Record<ServiceStatus, string> = {
  healthy: 'ring-emerald-500/30',
  degraded: 'ring-yellow-500/30',
  error: 'ring-red-500/30',
  unconfigured: 'ring-gray-300/30',
};

const SERVICE_LABELS: Record<string, string> = {
  supabaseLocal: 'Supabase Local',
  supabaseRemote: 'Supabase Remote',
  spotify: 'Spotify',
  googleCalendar: 'Google Calendar',
  googleDrive: 'Google Drive',
  gmailSmtp: 'Gmail SMTP',
  openrouter: 'OpenRouter',
  ollama: 'Ollama',
};

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export function ServicesStatusWidget() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['services-health'],
    queryFn: fetchHealth,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const services = data
    ? Object.entries(data.services).map(([key, check]) => ({
        key,
        label: SERVICE_LABELS[key] ?? check.name,
        status: check.status,
        latency: check.latencyMs,
      }))
    : [];

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const totalCount = services.length;

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader className="pb-1.5 pt-3 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wifi className="h-4 w-4 text-muted-foreground" />
          API Services
          {!isLoading && data && (
            <span className="text-xs font-normal text-muted-foreground">
              {healthyCount}/{totalCount}
            </span>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={cn('h-3 w-3', isRefetching && 'animate-spin')} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="pb-3 px-4 pt-0">
        {isLoading ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
              {services.map((svc) => (
                <div key={svc.key} className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={cn(
                      'flex-shrink-0 h-2 w-2 rounded-full ring-2',
                      STATUS_COLORS[svc.status],
                      STATUS_RING[svc.status]
                    )}
                    title={svc.status}
                  />
                  <span className="text-xs text-muted-foreground truncate">
                    {svc.label}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/admin/debug" className="block mt-2.5">
              <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-muted-foreground hover:text-foreground">
                Full Debug Dashboard
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
