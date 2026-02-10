'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { CohortAnalyticsResult } from '@/lib/services/cohort-analytics';
import { formatMetricValue, getCohortColor, getDimensionLabel, getMetricLabel } from './cohort.helpers';

interface ChartsProps {
  data: CohortAnalyticsResult;
}

export function Charts({ data }: ChartsProps) {
  // Transform data for chart
  const chartData = data.cohorts.map((cohort, index) => ({
    name: cohort.cohortName,
    value: cohort.metricValue,
    studentCount: cohort.studentCount,
    color: getCohortColor(index),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Comparison</CardTitle>
        <CardDescription>
          {getDimensionLabel(data.dimension)} vs {getMetricLabel(data.metric)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) =>
                  data.metric.includes('rate') || data.metric === 'mastery_rate'
                    ? `${value}%`
                    : value.toString()
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                formatter={(value: number | undefined) => [
                  formatMetricValue(data.metric, value ?? 0),
                  getMetricLabel(data.metric),
                ]}
                labelFormatter={(label) => `Cohort: ${label}`}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overall Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{data.overall.totalStudents}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average {getMetricLabel(data.metric)}</p>
            <p className="text-2xl font-bold">
              {formatMetricValue(data.metric, data.overall.averageMetric)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
