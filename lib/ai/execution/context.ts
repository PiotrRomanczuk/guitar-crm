/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Agent Context Builder
 *
 * Utilities for building standardized execution context for AI agents
 */

import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export interface AgentExecutionContext {
  userId: string;
  userRole: 'admin' | 'teacher' | 'student';
  sessionId: string;
  currentPage?: string;
  entityId?: string;
  entityType?: string;
  contextData: Record<string, any>;
}

/**
 * Build standardized context for server actions
 */
export async function buildAgentContext(
  entityId?: string,
  entityType?: string,
  additionalContext?: Record<string, any>
): Promise<AgentExecutionContext> {
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

/**
 * Validate agent context for required fields
 */
export function validateAgentContext(context: AgentExecutionContext): void {
  if (!context.userId) {
    throw new Error('User ID is required in agent context');
  }

  if (!context.userRole) {
    throw new Error('User role is required in agent context');
  }

  if (!context.sessionId) {
    throw new Error('Session ID is required in agent context');
  }
}
