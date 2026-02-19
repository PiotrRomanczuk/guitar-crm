export type HealthStatus = 'excellent' | 'good' | 'needs_attention' | 'at_risk' | 'critical';

export interface HealthFactors {
  daysSinceLastLesson: number;
  lessonsPerMonth: number;
  assignmentCompletionRate: number;
  daysSinceLastContact: number;
  totalLessonsCompleted: number;
}

export interface StudentHealthScore {
  score: number;
  status: HealthStatus;
  factors: HealthFactors;
  recommendedAction: string;
}

/**
 * Calculate a student's health score based on multiple factors
 *
 * Weights:
 * - Days since last lesson: 30%
 * - Lessons per month: 25%
 * - Assignment completion rate: 20%
 * - Days since last contact: 15%
 * - Total lessons completed: 10%
 *
 * Score ranges:
 * - 80-100: Excellent (green)
 * - 60-79: Good (light green)
 * - 40-59: Needs Attention (yellow)
 * - 20-39: At Risk (orange)
 * - 0-19: Critical (red)
 */
export function calculateHealthScore(factors: HealthFactors): StudentHealthScore {
  let score = 0;

  // Factor 1: Days since last lesson (30%)
  // Ideal: < 7 days, Bad: > 30 days
  const lessonScore = Math.max(0, Math.min(100, 100 - (factors.daysSinceLastLesson / 30) * 100));
  score += lessonScore * 0.3;

  // Factor 2: Lessons per month (25%)
  // Ideal: 4+ lessons/month, Bad: < 1 lesson/month
  const frequencyScore = Math.min(100, (factors.lessonsPerMonth / 4) * 100);
  score += frequencyScore * 0.25;

  // Factor 3: Assignment completion rate (20%)
  // Direct percentage (0-100)
  score += factors.assignmentCompletionRate * 0.2;

  // Factor 4: Days since last contact (15%)
  // Ideal: < 14 days, Bad: > 60 days
  const contactScore = Math.max(0, Math.min(100, 100 - (factors.daysSinceLastContact / 60) * 100));
  score += contactScore * 0.15;

  // Factor 5: Total lessons completed (10%)
  // More experience = better foundation (cap at 20 lessons for full score)
  const experienceScore = Math.min(100, (factors.totalLessonsCompleted / 20) * 100);
  score += experienceScore * 0.1;

  // Round final score
  const finalScore = Math.round(score);

  // Determine status
  let status: HealthStatus;
  let recommendedAction: string;

  if (finalScore >= 80) {
    status = 'excellent';
    recommendedAction = 'Keep up the great work! Consider introducing advanced techniques.';
  } else if (finalScore >= 60) {
    status = 'good';
    recommendedAction = 'Student is progressing well. Continue current lesson plan.';
  } else if (finalScore >= 40) {
    status = 'needs_attention';
    recommendedAction = 'Check in with student. May need encouragement or schedule adjustment.';
  } else if (finalScore >= 20) {
    status = 'at_risk';
    recommendedAction = 'Schedule a conversation to address barriers and re-engage student.';
  } else {
    status = 'critical';
    recommendedAction = 'Immediate attention required. Reach out today to prevent churn.';
  }

  // Override for specific critical conditions
  if (factors.daysSinceLastLesson > 45) {
    status = 'critical';
    recommendedAction = 'No lesson in 45+ days. Contact immediately to prevent churn.';
  }

  return {
    score: finalScore,
    status,
    factors,
    recommendedAction,
  };
}

/**
 * Get color scheme for health status
 */
export function getHealthStatusColor(status: HealthStatus): {
  text: string;
  bg: string;
  border: string;
  emoji: string;
} {
  switch (status) {
    case 'excellent':
      return {
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        emoji: '🟢',
      };
    case 'good':
      return {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        emoji: '🟢',
      };
    case 'needs_attention':
      return {
        text: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        emoji: '🟡',
      };
    case 'at_risk':
      return {
        text: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        emoji: '🟠',
      };
    case 'critical':
      return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        emoji: '🔴',
      };
  }
}
