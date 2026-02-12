'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, RefreshCw } from 'lucide-react';

interface ChartData {
  name: string;
  lessons: number;
  assignments: number;
}

interface ProgressChartProps {
  data: ChartData[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

function ProgressChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function ProgressChartError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-card rounded-xl border border-destructive/50 p-6">
      <h3 className="font-semibold text-destructive">Error loading chart</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Failed to load weekly progress data. Please try again.
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button onClick={onRetry} variant="outline" className="min-h-[44px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

function ProgressChartEmpty() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="font-semibold">Weekly Progress</h3>
        <p className="text-sm text-muted-foreground mt-1">Lessons and assignments completed</p>
      </div>
      <div className="py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <h4 className="text-lg font-semibold mb-2">No Data Available</h4>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Progress data will appear here once lessons and assignments are tracked.
        </p>
      </div>
    </div>
  );
}

export function ProgressChart({ data, isLoading, error, onRetry }: ProgressChartProps) {
  if (isLoading) return <ProgressChartSkeleton />;
  if (error) return <ProgressChartError onRetry={onRetry} />;

  const hasData = data.some((d) => d.lessons > 0 || d.assignments > 0);
  if (!hasData && data.length === 0) return <ProgressChartEmpty />;

  return (
    <div
      className="bg-card rounded-xl border border-border p-6 opacity-0 animate-fade-in"
      style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
      role="img"
      aria-label="Weekly progress chart showing lessons and assignments completed over the past week"
    >
      <div className="mb-6">
        <h3 className="font-semibold">Weekly Progress</h3>
        <p className="text-sm text-muted-foreground mt-1">Lessons and assignments completed</p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-muted-foreground"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-muted-foreground"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
            />
            <Area
              type="monotone"
              dataKey="lessons"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLessons)"
            />
            <Area
              type="monotone"
              dataKey="assignments"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAssignments)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'hsl(var(--chart-1))' }}
          />
          <span className="text-sm text-muted-foreground">Lessons</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'hsl(var(--chart-2))' }}
          />
          <span className="text-sm text-muted-foreground">Assignments</span>
        </div>
      </div>
    </div>
  );
}
