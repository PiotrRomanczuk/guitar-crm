'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CohortDimension, CohortMetric } from '@/lib/services/cohort-analytics';
import { useCohortAnalytics } from './useCohortAnalytics';
import { Filters } from './CohortAnalytics.Filters';
import { Charts } from './CohortAnalytics.Charts';
import { CohortTable } from './CohortAnalytics.Table';
import { getDimensionDescription, getMetricDescription } from './cohort.helpers';

export function CohortAnalytics() {
  const [dimension, setDimension] = useState<CohortDimension>('enrollment_period');
  const [metric, setMetric] = useState<CohortMetric>('mastery_rate');

  const { data, isLoading, error } = useCohortAnalytics({
    dimension,
    metric,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Cohort Analytics</h2>
        <p className="text-muted-foreground">
          Compare student groups to identify patterns and optimize teaching strategies.
        </p>
      </div>

      {/* Filters */}
      <Filters
        dimension={dimension}
        metric={metric}
        onDimensionChange={setDimension}
        onMetricChange={setMetric}
      />

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Current Selection</AlertTitle>
        <AlertDescription>
          <strong>Dimension:</strong> {getDimensionDescription(dimension)}
          <br />
          <strong>Metric:</strong> {getMetricDescription(metric)}
        </AlertDescription>
      </Alert>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load cohort analytics. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Data Display */}
      {!isLoading && !error && data && (
        <div className="space-y-6">
          <Charts data={data} />
          <CohortTable data={data} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data && data.cohorts.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            No cohort data available for the selected filters. Try adjusting your selection or
            check back later when more data is available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
