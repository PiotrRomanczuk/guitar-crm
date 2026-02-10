import { CohortAnalytics } from '@/components/dashboard/cohorts';

export const metadata = {
  title: 'Cohort Analytics | Guitar CRM',
  description: 'Compare student cohorts and identify patterns',
};

export default function CohortsPage() {
  return (
    <div className="container mx-auto p-6">
      <CohortAnalytics />
    </div>
  );
}
