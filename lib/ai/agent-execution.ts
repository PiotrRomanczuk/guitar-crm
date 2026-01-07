/**
 * Standardized Agent Execution Functions
 *
 * This file re-exports the modular agent execution system components
 * for backward compatibility. The actual implementation is now split
 * across focused modules in the execution/ directory.
 */

// Re-export everything from the modular execution system
export * from './execution';

// Maintain backward compatibility by explicitly re-exporting main functions
export {
  buildAgentContext,
  generateEmailDraftAgent,
  generateLessonNotesAgent,
  generateAssignmentAgent,
  generatePostLessonSummaryAgent,
  analyzeStudentProgressAgent,
  generateAdminInsightsAgent,
  executeCustomAgent,
  isAgentSuccess,
  extractAgentResult,
  formatAgentError,
  checkAgentAvailability,
  executeBatchAgents,
} from './execution';
