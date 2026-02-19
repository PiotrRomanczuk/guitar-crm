'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Mail, CheckCircle, XCircle, AlertCircle, UserX } from 'lucide-react';
import { useNotificationAnalytics } from './useNotificationAnalytics';
import { NotificationCharts } from './NotificationAnalytics.Charts';

type DateRange = 7 | 30 | 90;

const DATE_RANGE_OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
];

export function NotificationAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const { data: analytics, isLoading, error } = useNotificationAnalytics({ days: dateRange });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load analytics data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Analytics</h2>
          <p className="text-muted-foreground">Monitor email notification performance</p>
        </div>
        <Select
          value={dateRange.toString()}
          onValueChange={(value) => setDateRange(parseInt(value) as DateRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Total Sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSent.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Success Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Failure Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.failureRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Bounce Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.bounceRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-blue-600" />
              Opt-out Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.optOutRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <NotificationCharts analytics={analytics} />
    </div>
  );
}
