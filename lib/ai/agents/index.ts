/**
 * Agent Registry Index
 *
 * Central export point for all agent categories and registration
 */

import { registerAgent } from '../registry';

// Import agents by category
import { emailDraftAgent } from './communication';
import { lessonNotesAgent, assignmentGeneratorAgent, postLessonSummaryAgent } from './content';
import { progressInsightsAgent, adminInsightsAgent } from './analytics';
import { songNormalizationAgent } from './song-normalization';

// Register all agents
export function registerAllAgents(): void {
  // Communication agents
  registerAgent(emailDraftAgent);

  // Content generation agents
  registerAgent(lessonNotesAgent);
  registerAgent(assignmentGeneratorAgent);
  registerAgent(postLessonSummaryAgent);

  // Analytics agents
  registerAgent(progressInsightsAgent);
  registerAgent(adminInsightsAgent);

  // System agents
  registerAgent(songNormalizationAgent);

  console.log('[AgentRegistry] All agents registered successfully');
}

// Export all agent specifications for reference
export {
  // Communication
  emailDraftAgent,

  // Content
  lessonNotesAgent,
  assignmentGeneratorAgent,
  postLessonSummaryAgent,

  // Analytics
  progressInsightsAgent,
  adminInsightsAgent,

  // System
  songNormalizationAgent,
};

// Export agent categories for organized access
export const communicationAgents = {
  emailDraftAgent,
};

export const contentAgents = {
  lessonNotesAgent,
  assignmentGeneratorAgent,
  postLessonSummaryAgent,
};

export const analyticsAgents = {
  progressInsightsAgent,
  adminInsightsAgent,
};

// Export system agents for data processing
export const systemAgents = {
  songNormalizationAgent,
};
