'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveLine } from '@nivo/line';
import * as ss from 'simple-statistics';
import type { SongStatsGrowthMonth } from '@/types/SongStatsAdvanced';

interface Props {
  data: SongStatsGrowthMonth[];
}

export function SongStatsGrowthChart({ data }: Props) {
  const cumulativeCounts = data.map((item) => item.cumulative);
  const indices = cumulativeCounts.map((_, i) => i);

  let forecast = null;
  let rSquared = 0;
  if (cumulativeCounts.length >= 3) {
    const points = indices.map((x, i) => [x, cumulativeCounts[i]] as [number, number]);
    const reg = ss.linearRegression(points);
    const predictFunc = (x: number) => reg.m * x + reg.b;
    rSquared = ss.rSquared(points, predictFunc);

    const forecastPoints = [];
    for (let i = 1; i <= 3; i++) {
      const x = indices.length - 1 + i;
      forecastPoints.push(Math.max(0, Math.round(reg.m * x + reg.b)));
    }
    forecast = { points: forecastPoints, monthlyGrowth: reg.m };
  }

  const formatMonth = (month: string) =>
    new Date(month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });

  const lineData = [
    {
      id: 'Library Size',
      data: data.map((item) => ({
        x: formatMonth(item.month),
        y: item.cumulative,
      })),
    },
  ];

  if (forecast && data.length > 0) {
    const lastMonth = data[data.length - 1];
    const lastDate = new Date(lastMonth.month + '-01');

    const forecastData = forecast.points.map((y, i) => {
      const d = new Date(lastDate);
      d.setMonth(d.getMonth() + i + 1);
      return {
        x: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        y,
      };
    });

    lineData.push({
      id: 'Forecast',
      data: [
        { x: formatMonth(lastMonth.month), y: lastMonth.cumulative },
        ...forecastData,
      ],
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Library Growth & Forecast</CardTitle>
        <CardDescription>
          Cumulative song count over time
          {forecast && (
            <span className="ml-2 text-xs font-medium">
              {'\u2022'} Growth: {forecast.monthlyGrowth > 0 ? '+' : ''}
              {forecast.monthlyGrowth.toFixed(1)} songs/month (R² = {rSquared.toFixed(2)})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: -45,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
            }}
            colors={(d) =>
              d.id === 'Forecast' ? 'hsl(217, 91%, 60%)' : 'hsl(142, 71%, 45%)'
            }
            lineWidth={2}
            pointSize={6}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableGridX={false}
            enableGridY={true}
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
                symbolShape: 'circle',
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
                  strokeWidth: 1,
                },
              },
              legends: {
                text: {
                  fontSize: 12,
                  fill: 'hsl(var(--foreground))',
                },
              },
            }}
            tooltip={({ point }) => (
              <div className="bg-background border border-border rounded px-3 py-2 shadow-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">{point.data.xFormatted}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: point.serieColor }}
                    />
                    <span className="text-sm">
                      {point.serieId}: {point.data.yFormatted}
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
