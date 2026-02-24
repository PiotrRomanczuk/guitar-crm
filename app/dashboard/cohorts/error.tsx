'use client';

import { RouteError } from '@/components/shared/RouteError';

export default function CohortsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} context="cohorts" />;
}
