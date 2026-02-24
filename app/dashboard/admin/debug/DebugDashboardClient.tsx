'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ServicesGrid,
  CronStatusPanel,
  AIProviderPanel,
  AIQueuePanel,
  AIGenerationsPanel,
  DebugRefreshButton,
} from '@/components/debug';
import type { HealthResponse, AIDebugResponse } from '@/types/health';

type FetchState<T> = { data: T | null; error: string | null };

export function DebugDashboardClient() {
  const [health, setHealth] = useState<FetchState<HealthResponse>>({ data: null, error: null });
  const [aiDebug, setAiDebug] = useState<FetchState<AIDebugResponse>>({ data: null, error: null });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [healthRes, aiRes] = await Promise.allSettled([
        fetch('/api/health').then((r) => r.json() as Promise<HealthResponse>),
        fetch('/api/ai/debug').then((r) => r.json() as Promise<AIDebugResponse>),
      ]);

      setHealth(
        healthRes.status === 'fulfilled'
          ? { data: healthRes.value, error: null }
          : { data: null, error: String(healthRes.reason) }
      );
      setAiDebug(
        aiRes.status === 'fulfilled'
          ? { data: aiRes.value, error: null }
          : { data: null, error: String(aiRes.reason) }
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Debug</h1>
          <p className="text-sm text-muted-foreground">Live status for all external services and AI infrastructure.</p>
        </div>
        <DebugRefreshButton onRefresh={fetchData} isLoading={isLoading} />
      </div>

      {health.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Health check error: {health.error}</AlertDescription>
        </Alert>
      )}

      {health.data && <ServicesGrid health={health.data} />}
      {health.data && <CronStatusPanel crons={health.data.crons} />}

      {aiDebug.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>AI debug error: {aiDebug.error}</AlertDescription>
        </Alert>
      )}

      {aiDebug.data && (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">AI Infrastructure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AIProviderPanel ai={aiDebug.data} />
              <AIQueuePanel ai={aiDebug.data} />
            </div>
          </div>
          <AIGenerationsPanel ai={aiDebug.data} />
        </>
      )}
    </div>
  );
}
