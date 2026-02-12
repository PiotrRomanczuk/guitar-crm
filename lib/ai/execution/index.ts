/**
 * Agent Execution - Main Export
 *
 * Central export point for all agent execution functionality
 */

// Re-export context utilities
export { buildAgentContext, validateAgentContext, type AgentExecutionContext } from './context';

// Re-export individual agent functions
export {
  generateEmailDraftAgent,
  generateLessonNotesAgent,
  generateAssignmentAgent,
  generatePostLessonSummaryAgent,
  analyzeStudentProgressAgent,
  generateAdminInsightsAgent,
  generateChatResponseAgent,
} from './agents';

// Re-export response utilities
export {
  isAgentSuccess,
  extractAgentResult,
  formatAgentError,
  extractAgentMetadata,
  createErrorResponse,
} from './response-utils';

// Re-export batch and availability functions
export {
  checkAgentAvailability,
  executeBatchAgents,
  executeCustomAgent,
  getAvailableAgents,
} from './batch';

// Re-export main types from registry
export type { AgentResponse } from '../agent-registry';
