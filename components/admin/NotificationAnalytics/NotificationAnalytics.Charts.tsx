'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  Legend,
} from 'recharts';
import type { NotificationAnalytics } from '@/types/notifications';
import { NOTIFICATION_TYPE_INFO } from '@/types/notifications';

interface ChartsProps {
  analytics: NotificationAnalytics;
}

const STATUS_COLORS = {
  success: 'hsl(var(--chart-1))',
  failure: 'hsl(var(--chart-2))',
  bounce: 'hsl(var(--chart-3))',
  optOut: 'hsl(var(--chart-4))',
};

export function NotificationCharts({ analytics }: ChartsProps) {
  // Format data for daily trend chart
  const dailyTrendData = analytics.sentByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: item.count,
  }));

  // Format data for success/failure pie chart
  const statusData = [
    { name: 'Success', value: analytics.successRate, color: STATUS_COLORS.success },
    { name: 'Failure', value: analytics.failureRate, color: STATUS_COLORS.failure },
    { name: 'Bounce', value: analytics.bounceRate, color: STATUS_COLORS.bounce },
    { name: 'Opt-out', value: analytics.optOutRate, color: STATUS_COLORS.optOut },
  ].filter((item) => item.value > 0);

  // Format data for notifications by type chart
  const typeData = Object.entries(analytics.sentByType)
    .map(([type, count]) => ({
      type: NOTIFICATION_TYPE_INFO[type as keyof typeof NOTIFICATION_TYPE_INFO]?.label || type,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 types

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daily Notifications Trend</CardTitle>
          <CardDescription>Total notifications sent per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData}>
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown by delivery status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={((value: number) => `${value.toFixed(1)}%`) as never}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Notification Types</CardTitle>
            <CardDescription>Most frequently sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical">
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="type"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
