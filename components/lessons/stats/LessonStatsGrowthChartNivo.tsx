'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveLine } from '@nivo/line';
import * as ss from 'simple-statistics';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  data: AdvancedLessonStats['studentGrowth'];
}

export function LessonStatsGrowthChartNivo({ data }: Props) {
  const cumulativeCounts = data.map((item) => item.cumulativeStudents);
  const indices = cumulativeCounts.map((_, i) => i);

  let forecast = null;
  if (cumulativeCounts.length >= 3) {
    const points = indices.map((x, i) => [x, cumulativeCounts[i]] as [number, number]);
    const linearReg = ss.linearRegression(points);

    const forecastMonths = 3;
    const forecastPoints = [];
    for (let i = 1; i <= forecastMonths; i++) {
      const x = indices.length - 1 + i;
      const y = Math.max(0, linearReg.m * x + linearReg.b);
      forecastPoints.push(y);
    }

    forecast = {
      points: forecastPoints,
      monthlyGrowth: linearReg.m,
    };
  }

  const lineData = [
    {
      id: 'Total Students',
      data: data.map((item) => ({
        x: new Date(item.month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        y: item.cumulativeStudents,
      })),
    },
  ];

  if (forecast) {
    const lastMonth = data[data.length - 1];
    const lastDate = new Date(lastMonth.month + '-01');

    const forecastData = forecast.points.map((y, i) => {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
      return {
        x: forecastDate.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        y: Math.round(y),
      };
    });

    lineData.push({
      id: 'Forecast',
      data: [
        {
          x: lineData[0].data[lineData[0].data.length - 1].x,
          y: lastMonth.cumulativeStudents,
        },
        ...forecastData,
      ],
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Growth & Forecast</CardTitle>
        <CardDescription>
          Cumulative student growth over time
          {forecast && (
            <span className="ml-2 text-xs font-medium">
              • Growth: {forecast.monthlyGrowth > 0 ? '+' : ''}
              {forecast.monthlyGrowth.toFixed(1)} students/month
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            curve="monotoneX"
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: -45,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
            }}
            colors={(d) => (d.id === 'Forecast' ? 'hsl(217, 91%, 60%)' : 'hsl(142, 71%, 45%)')}
            lineWidth={2}
            pointSize={6}
            pointBorderWidth={2}
            enableGridX={false}
            useMesh={true}
            legends={[
              {
                anchor: 'top-left',
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
          />
        </div>
      </CardContent>
    </Card>
  );
}
