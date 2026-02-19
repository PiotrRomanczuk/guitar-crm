 
/**
 * Agent Response Utilities
 *
 * Utilities for handling agent responses, errors, and formatting
 */

import type { AgentResponse } from '../agent-registry';

/**
 * Check if agent response was successful
 */
export function isAgentSuccess(response: AgentResponse): boolean {
  return response.success;
}

/**
 * Extract result from successful agent response
 */
export function extractAgentResult(response: AgentResponse): unknown {
  if (!response.success) {
    throw new Error(response.error?.message || 'Agent execution failed');
  }
  return response.result;
}

/**
 * Format agent error for user-friendly display
 */
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
    case 'AGENT_NOT_FOUND':
      return 'The requested AI feature is not available.';
    case 'CONTEXT_ERROR':
      return 'Unable to prepare the necessary context. Please try again.';
    default:
      return error.message || 'An error occurred while processing your request.';
  }
}

/**
 * Safely extract metadata from agent response
 */
export function extractAgentMetadata(response: AgentResponse) {
  return {
    executionTime: response.metadata.executionTime,
    model: response.metadata.model,
    provider: response.metadata.provider,
    tokensUsed: response.metadata.tokensUsed,
    successful: response.success,
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  agentId: string = 'unknown'
): AgentResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
    metadata: {
      agentId,
      executionTime: 0,
      model: 'unknown',
      provider: 'unknown',
    },
    analytics: {
      requestId: `error_${Date.now()}`,
      timestamp: new Date(),
      inputHash: 'error',
      successful: false,
    },
  };
}
