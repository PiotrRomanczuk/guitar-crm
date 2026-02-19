/**
 * Agent I/O Type Definitions
 *
 * Typed input/output interfaces for all AI agent generation types.
 * Follows the SongNormalizationInput/Result pattern from song-normalization.ts.
 */

// ─── Lesson Notes ───────────────────────────────────────────

export interface LessonNotesInput {
  studentName: string;
  studentId?: string;
  songTitle?: string;
  lessonFocus?: string;
  skillsWorked?: string;
  nextSteps?: string;
}

export interface LessonNotesResult {
  content: string;
  sections: {
    topicsCovered: string;
    progress: string;
    practiceRecommendations: string;
    nextSteps: string;
  };
}

// ─── Assignment ─────────────────────────────────────────────

export interface AssignmentInput {
  studentName: string;
  studentId?: string;
  skillLevel: string;
  focusArea: string;
  timeAvailable?: string;
  additionalNotes?: string;
}

export interface AssignmentResult {
  content: string;
  objectives: string[];
  practiceSteps: string[];
  estimatedDuration: string;
}

// ─── Email Draft ────────────────────────────────────────────

export interface EmailDraftInput {
  templateType: string;
  studentName: string;
  studentId?: string;
  context?: string;
  tone?: string;
  additionalInfo?: string;
}

export interface EmailDraftResult {
  subject: string;
  body: string;
  tone: string;
}

// ─── Post-Lesson Summary ────────────────────────────────────

export interface PostLessonSummaryInput {
  studentName: string;
  studentId?: string;
  songTitle?: string;
  lessonDuration?: string;
  skillsWorked?: string;
  challengesNoted?: string;
  nextSteps?: string;
}

export interface PostLessonSummaryResult {
  content: string;
  highlights: string[];
  areasForImprovement: string[];
  practiceRecommendations: string[];
}

// ─── Student Progress ───────────────────────────────────────

export interface StudentProgressInput {
  studentData: Record<string, unknown>;
  studentId?: string;
  timePeriod?: string;
  lessonHistory?: Record<string, unknown>;
  skillAssessments?: Record<string, unknown>;
}

export interface StudentProgressResult {
  content: string;
  trends: string[];
  strengths: string[];
  areasForGrowth: string[];
  recommendations: string[];
}

// ─── Admin Insights ─────────────────────────────────────────

export interface AdminInsightsInput {
  dashboardData: Record<string, unknown>;
  timeframe?: string;
  focusAreas?: string[];
}

export interface AdminInsightsResult {
  content: string;
  keyMetrics: string[];
  opportunities: string[];
  actionItems: string[];
}

// ─── Chat Assistant ─────────────────────────────────────────

export interface ChatAssistantInput {
  prompt: string;
  model?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatAssistantResult {
  content: string;
  suggestedFollowUps?: string[];
}
