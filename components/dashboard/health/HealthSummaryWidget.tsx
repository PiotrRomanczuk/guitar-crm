'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentHealth {
  healthStatus: 'excellent' | 'good' | 'needs_attention' | 'at_risk' | 'critical';
}

async function fetchStudentHealth(): Promise<StudentHealth[]> {
  const response = await fetch('/api/students/health');
  if (!response.ok) {
    throw new Error('Failed to fetch student health');
  }
  return response.json();
}

export function HealthSummaryWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-health'],
    queryFn: fetchStudentHealth,
    refetchInterval: 180000, // Refetch every 3 minutes
  });

  const healthyCounts = {
    excellent: data?.filter((s) => s.healthStatus === 'excellent').length || 0,
    good: data?.filter((s) => s.healthStatus === 'good').length || 0,
    needs_attention: data?.filter((s) => s.healthStatus === 'needs_attention').length || 0,
    at_risk: data?.filter((s) => s.healthStatus === 'at_risk').length || 0,
    critical: data?.filter((s) => s.healthStatus === 'critical').length || 0,
  };

  const totalHealthy = healthyCounts.excellent + healthyCounts.good;
  const totalConcern =
    healthyCounts.needs_attention + healthyCounts.at_risk + healthyCounts.critical;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Student Health
        </CardTitle>
        <CardDescription>Overall engagement and retention metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-success">{totalHealthy}</div>
                <div className="text-sm text-muted-foreground">Healthy Students</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-warning">{totalConcern}</div>
                <div className="text-sm text-muted-foreground">Need Attention</div>
              </div>
            </div>

            {healthyCounts.critical > 0 && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium">
                ⚠️ {healthyCounts.critical} student{healthyCounts.critical > 1 ? 's' : ''} in
                critical status
              </div>
            )}

            <Link href="/dashboard/health" className="block">
              <Button variant="outline" className="w-full">
                View Full Health Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
