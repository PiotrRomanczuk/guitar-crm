'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PipelineStage {
  id: 'lead' | 'trial' | 'active' | 'at_risk';
  label: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
}

interface PipelineData {
  stages: PipelineStage[];
  conversions: {
    leadToTrial: number;
    trialToActive: number;
  };
}

async function fetchPipelineData(): Promise<PipelineData> {
  const response = await fetch('/api/students/pipeline');
  if (!response.ok) {
    throw new Error('Failed to fetch pipeline data');
  }
  return response.json();
}

interface StudentPipelineProps {
  onStageClick?: (stageId: string) => void;
}

export function StudentPipeline({ onStageClick }: StudentPipelineProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-pipeline'],
    queryFn: fetchPipelineData,
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading pipeline</CardTitle>
          <CardDescription>Failed to fetch student pipeline data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const stages = data?.stages || [];
  const conversions = data?.conversions || { leadToTrial: 0, trialToActive: 0 };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Student Pipeline
        </CardTitle>
        <CardDescription>Track students through your funnel</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-12" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pipeline Stages */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <button
                    key={stage.id}
                    onClick={() => onStageClick?.(stage.id)}
                    className={cn(
                      'relative p-4 rounded-lg border-2 transition-all hover:shadow-md',
                      stage.borderColor,
                      stage.bgColor,
                      'text-left group'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={cn(
                          'p-2 rounded-md',
                          stage.color,
                          'bg-white/50 dark:bg-black/20'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {index < stages.length - 1 && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                          <div className="bg-background rounded-full p-1 shadow-sm">
                            <svg
                              className="h-4 w-4 text-muted-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={cn('text-3xl font-bold mb-1', stage.color)}>{stage.count}</div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stage.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Conversion Metrics */}
            {(conversions.leadToTrial > 0 || conversions.trialToActive > 0) && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Conversion Rates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Lead → Trial</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {conversions.leadToTrial}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Trial → Active</div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {conversions.trialToActive}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
