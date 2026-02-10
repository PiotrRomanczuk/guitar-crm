'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CohortAnalyticsResult } from '@/lib/services/cohort-analytics';
import { formatMetricValue, getDimensionLabel, getMetricLabel } from './cohort.helpers';

interface CohortTableProps {
  data: CohortAnalyticsResult;
}

export function CohortTable({ data }: CohortTableProps) {
  // Sort cohorts by metric value (descending)
  const sortedCohorts = [...data.cohorts].sort((a, b) => b.metricValue - a.metricValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Breakdown</CardTitle>
        <CardDescription>All cohorts ranked by {getMetricLabel(data.metric)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>{getDimensionLabel(data.dimension)}</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">{getMetricLabel(data.metric)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCohorts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedCohorts.map((cohort, index) => (
                  <TableRow key={cohort.cohortId}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{cohort.cohortName}</TableCell>
                    <TableCell className="text-right">{cohort.studentCount}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMetricValue(data.metric, cohort.metricValue)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
