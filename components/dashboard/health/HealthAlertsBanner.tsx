'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

interface StudentHealth {
  id: string;
  name: string;
  healthScore: number;
  healthStatus: 'excellent' | 'good' | 'needs_attention' | 'at_risk' | 'critical';
}

async function fetchStudentHealth(): Promise<StudentHealth[]> {
  const response = await fetch('/api/students/health');
  if (!response.ok) {
    throw new Error('Failed to fetch student health');
  }
  return response.json();
}

export function HealthAlertsBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ['student-health'],
    queryFn: fetchStudentHealth,
    refetchInterval: 180000, // Refetch every 3 minutes
  });

  const criticalStudents = data?.filter((s) => s.healthStatus === 'critical') || [];
  const atRiskStudents = data?.filter((s) => s.healthStatus === 'at_risk') || [];

  const showCriticalAlert = criticalStudents.length > 0;
  const showAtRiskAlert = atRiskStudents.length > 0 && criticalStudents.length === 0;

  if (dismissed || (!showCriticalAlert && !showAtRiskAlert)) {
    return null;
  }

  return (
    <Alert variant={showCriticalAlert ? 'destructive' : 'default'} className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between pr-8">
        {showCriticalAlert
          ? `${criticalStudents.length} Student${
              criticalStudents.length > 1 ? 's' : ''
            } Need Immediate Attention`
          : `${atRiskStudents.length} Student${atRiskStudents.length > 1 ? 's' : ''} At Risk`}
      </AlertTitle>
      <AlertDescription className="flex items-center gap-4">
        <span>
          {showCriticalAlert
            ? 'Critical health issues detected. Review and take action immediately.'
            : 'Students showing signs of disengagement. Consider reaching out.'}
        </span>
        <Link href="/dashboard/health">
          <Button variant={showCriticalAlert ? 'default' : 'outline'} size="sm">
            View Details
          </Button>
        </Link>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
