/**
 * Standardized Agent Execution Functions
 *
 * This module provides standardized wrapper functions for executing
 * AI agents. Every AI use in the application should go through these
 * functions to ensure consistent behavior and monitoring.
 */

import { executeAgent, type AgentResponse } from './agent-registry';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

// Standardized context builder for server actions
export async function buildAgentContext(
  entityId?: string,
  entityType?: string,
  additionalContext?: Record<string, any>
) {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const userRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';

  return {
    userId: user.id,
    userRole: userRole as 'admin' | 'teacher' | 'student',
    sessionId: `session_${Date.now()}`,
    currentPage: undefined, // Will be set by client if available
    entityId,
    entityType,
    contextData: additionalContext || {},
  };
}

// Email Draft Generator Execution
export async function generateEmailDraftAgent(input: {
  template_type:
    | 'lesson_reminder'
    | 'progress_report'
    | 'payment_reminder'
    | 'milestone_celebration';
  student_name: string;
  student_id?: string;
  lesson_date?: string;
  lesson_time?: string;
  practice_songs?: string;
  notes?: string;
  amount?: string;
  due_date?: string;
  achievement?: string;
}): Promise<AgentResponse> {
  const context = await buildAgentContext(input.student_id, 'student', {
    templateType: input.template_type,
  });

  return executeAgent('email-draft-generator', input, context);
}

// Lesson Notes Assistant Execution
export async function generateLessonNotesAgent(input: {
  student_name: string;
  student_id?: string;
  lesson_topic?: string;
  songs_covered?: string;
  techniques_practiced?: string;
  student_progress?: string;
  areas_to_focus?: string;
  homework_assigned?: string;
  next_lesson_goals?: string;
}): Promise<AgentResponse> {
  const context = await buildAgentContext(input.student_id, 'student');

  return executeAgent('lesson-notes-assistant', input, context);
}

// Assignment Generator Execution
export async function generateAssignmentAgent(input: {
  student_name: string;
  student_id?: string;
  student_level?: string;
  song_title?: string;
  song_artist?: string;
  assignment_focus?: string;
  duration_weeks?: string;
  specific_techniques?: string;
  difficulty_level?: string;
}): Promise<AgentResponse> {
  const context = await buildAgentContext(input.student_id, 'student', {
    songInfo: {
      title: input.song_title,
      artist: input.song_artist,
    },
  });

  return executeAgent('assignment-generator', input, context);
}

// Post-Lesson Summary Execution
export async function generatePostLessonSummaryAgent(input: {
  student_name: string;
  student_id?: string;
  lesson_date?: string;
  songs_practiced?: string;
  techniques_covered?: string;
  achievements?: string;
  challenges?: string;
  practice_recommendations?: string;
  next_focus?: string;
}): Promise<AgentResponse> {
  const context = await buildAgentContext(input.student_id, 'student');

  return executeAgent('post-lesson-summary', input, context);
}

// Student Progress Insights Execution
export async function analyzeStudentProgressAgent(input: {
  student_ids: string[];
  time_period?: string;
  analysis_focus?: string;
}): Promise<AgentResponse> {
  const context = await buildAgentContext(undefined, 'analysis', {
    analysisType: 'student_progress',
    timePeriod: input.time_period || '30_days',
  });

  return executeAgent('student-progress-insights', input, context);
}

// Admin Dashboard Insights Execution
export async function generateAdminInsightsAgent(input: {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_lessons: number;
  analysis_period?: string;
}): Promise<AgentResponse> {
  const context = await buildAgentContext(undefined, 'analysis', {
    analysisType: 'admin_dashboard',
    businessMetrics: true,
  });

  return executeAgent('admin-dashboard-insights', input, context);
}

// Generic agent execution with full flexibility
export async function executeCustomAgent(
  agentId: string,
  input: Record<string, any>,
  entityId?: string,
  entityType?: string,
  additionalContext?: Record<string, any>
): Promise<AgentResponse> {
  const context = await buildAgentContext(entityId, entityType, additionalContext);

  return executeAgent(agentId, input, context);
}

// Utility functions for response handling
export function isAgentSuccess(response: AgentResponse): boolean {
  return response.success;
}

export function extractAgentResult(response: AgentResponse): any {
  if (!response.success) {
    throw new Error(response.error?.message || 'Agent execution failed');
  }
  return response.result;
}

export function formatAgentError(response: AgentResponse): string {
  if (response.success) {
    return '';
  }

  const error = response.error;
  if (!error) {
    return 'Unknown error occurred';
  }

  // Provide user-friendly error messages
  switch (error.code) {
    case 'EXECUTION_FAILED':
      return 'AI service is currently unavailable. Please try again in a moment.';
    case 'VALIDATION_ERROR':
      return 'Invalid input provided. Please check your data and try again.';
    case 'PERMISSION_DENIED':
      return 'You do not have permission to use this AI feature.';
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment before trying again.';
    default:
      return error.message || 'An error occurred while processing your request.';
  }
}

// Agent availability checker
export async function checkAgentAvailability(agentId: string): Promise<{
  available: boolean;
  reason?: string;
}> {
  try {
    const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

    if (!user) {
      return { available: false, reason: 'Authentication required' };
    }

    // Import registry to check agent specs
    const { agentRegistry } = await import('./agent-registry');
    const agents = agentRegistry.getAgents();
    const agent = agents.find((a) => a.id === agentId);

    if (!agent) {
      return { available: false, reason: 'Agent not found' };
    }

    const userRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';

    if (!agent.targetUsers.includes(userRole as any)) {
      return { available: false, reason: 'Insufficient permissions' };
    }

    return { available: true };
  } catch (error) {
    return { available: false, reason: 'System error' };
  }
}

// Batch agent execution for multiple requests
export async function executeBatchAgents(
  requests: Array<{
    agentId: string;
    input: Record<string, any>;
    entityId?: string;
    entityType?: string;
  }>
): Promise<AgentResponse[]> {
  const results: AgentResponse[] = [];

  // Execute in parallel with concurrency limit
  const BATCH_SIZE = 3;

  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map((request) =>
      executeCustomAgent(request.agentId, request.input, request.entityId, request.entityType)
    );

    const batchResults = await Promise.allSettled(batchPromises);

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // Create error response for failed requests
        results.push({
          success: false,
          error: {
            code: 'BATCH_EXECUTION_FAILED',
            message:
              result.reason instanceof Error ? result.reason.message : 'Batch execution failed',
          },
          metadata: {
            agentId: 'unknown',
            executionTime: 0,
            model: 'unknown',
            provider: 'unknown',
          },
          analytics: {
            requestId: `batch_error_${Date.now()}`,
            timestamp: new Date(),
            inputHash: 'error',
            successful: false,
          },
        });
      }
    }
  }

  return results;
}
