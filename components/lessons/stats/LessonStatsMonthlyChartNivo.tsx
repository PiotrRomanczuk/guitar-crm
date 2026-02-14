'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import * as ss from 'simple-statistics';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  data: AdvancedLessonStats['monthlyTrend'];
}

export function LessonStatsMonthlyChartNivo({ data }: Props) {
  // Calculate trend analysis
  const totals = data.map((item) => item.total);
  const indices = totals.map((_, i) => i);

  let trendInfo = null;
  if (totals.length >= 2) {
    const points = indices.map((x, i) => [x, totals[i]] as [number, number]);
    const linearReg = ss.linearRegression(points);
    const linearRegFunc = (x: number) => linearReg.m * x + linearReg.b;
    const rSquared = ss.rSquared(points, linearRegFunc);

    trendInfo = {
      slope: linearReg.m,
      rSquared,
      direction: linearReg.m > 0 ? 'growing' : linearReg.m < 0 ? 'declining' : 'stable',
    };
  }

  const chartData = data.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    Completed: item.completed,
    Cancelled: item.cancelled,
    Scheduled: item.scheduled,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Lesson Trend</CardTitle>
        <CardDescription>
          Lessons by status over time
          {trendInfo && (
            <span className="ml-2 text-xs font-medium">
              • Trend: {trendInfo.direction} ({trendInfo.slope > 0 ? '+' : ''}
              {trendInfo.slope.toFixed(1)} lessons/month, R² = {trendInfo.rSquared.toFixed(2)})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveBar
            data={chartData}
            keys={['Completed', 'Cancelled', 'Scheduled']}
            indexBy="month"
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            groupMode="stacked"
            valueScale={{ type: 'linear' }}
            colors={['hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)', 'hsl(217, 91%, 60%)']}
            borderRadius={4}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: -45,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
            }}
            enableGridY={true}
            enableLabel={false}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top',
                direction: 'row',
                translateY: -20,
                itemsSpacing: 10,
                itemWidth: 100,
                itemHeight: 20,
                symbolSize: 12,
              },
            ]}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 11,
                    fill: 'hsl(var(--muted-foreground))',
                  },
                },
              },
              grid: {
                line: {
                  stroke: 'hsl(var(--border))',
                },
              },
            }}
            tooltip={({ id, value, color }) => (
              <div className="bg-background border rounded px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium">{id}:</span>
                  <span>{value}</span>
                </div>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
