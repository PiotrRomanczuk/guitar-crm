/**
 * Agent Specifications Registry
 *
 * This file re-exports agent specifications from the modular agent files
 * for backward compatibility and provides the central registration function.
 *
 * The actual agent specifications are now organized by category:
 * - agents/communication.ts - Communication-related agents
 * - agents/content.ts - Content generation agents
 * - agents/analytics.ts - Data analysis and insights agents
 */

// Import and re-export all agents and registration function
export {
  registerAllAgents,
  emailDraftAgent,
  lessonNotesAgent,
  assignmentGeneratorAgent,
  postLessonSummaryAgent,
  progressInsightsAgent,
  adminInsightsAgent,
  communicationAgents,
  contentAgents,
  analyticsAgents,
} from './agents';
