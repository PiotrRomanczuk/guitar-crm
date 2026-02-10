'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CohortDimension, CohortMetric } from '@/lib/services/cohort-analytics';
import { getDimensionLabel, getMetricLabel } from './cohort.helpers';

interface FiltersProps {
  dimension: CohortDimension;
  metric: CohortMetric;
  onDimensionChange: (dimension: CohortDimension) => void;
  onMetricChange: (metric: CohortMetric) => void;
}

const dimensions: CohortDimension[] = [
  'enrollment_period',
  'status',
  'teacher',
  'lesson_frequency',
];

const metrics: CohortMetric[] = [
  'lessons_completed',
  'mastery_rate',
  'completion_rate',
  'retention_rate',
  'avg_time_to_master',
];

export function Filters({ dimension, metric, onDimensionChange, onMetricChange }: FiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="dimension-select">Group By</Label>
        <Select value={dimension} onValueChange={(v) => onDimensionChange(v as CohortDimension)}>
          <SelectTrigger id="dimension-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dimensions.map((d) => (
              <SelectItem key={d} value={d}>
                {getDimensionLabel(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metric-select">Metric</Label>
        <Select value={metric} onValueChange={(v) => onMetricChange(v as CohortMetric)}>
          <SelectTrigger id="metric-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {metrics.map((m) => (
              <SelectItem key={m} value={m}>
                {getMetricLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
