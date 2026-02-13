/**
 * Token Estimation Utilities
 *
 * Provides token counting and estimation for AI streaming operations
 */

/**
 * Model-specific token ratios (characters per token)
 * Based on empirical data from different models
 */
const MODEL_TOKEN_RATIOS: Record<string, number> = {
  // OpenRouter models
  'openrouter/auto:free': 4,
  'meta-llama/llama-3.3-70b-instruct:free': 3.8,
  'google/gemini-2.0-flash-exp:free': 4.2,
  'google/gemma-3-27b-it:free': 4.0,
  'meta-llama/llama-3.2-3b-instruct:free': 3.9,
  'mistralai/mistral-7b-instruct:free': 3.7,
  'qwen/qwen-2.5-vl-7b-instruct:free': 4.1,
  'deepseek/deepseek-r1:free': 3.5, // Reasoning models tend to be more verbose

  // Default fallback
  default: 4.0,
};

/**
 * Agent-specific expected response lengths (in tokens)
 * Based on typical outputs for each agent type
 */
const AGENT_EXPECTED_LENGTHS: Record<string, number> = {
  'chat-assistant': 150,
  'lesson-notes-assistant': 200,
  'assignment-generator': 250,
  'email-draft-generator': 180,
  'post-lesson-summary': 220,
  'student-progress-insights': 300,
  'admin-dashboard-insights': 350,
  'ai-response-stream': 150, // Generic chat

  // Default
  default: 200,
};

/**
 * Estimate the number of tokens in a text string
 *
 * @param text - The text to estimate tokens for
 * @param modelId - Optional model ID for model-specific estimation
 * @returns Estimated token count
 */
export function estimateTokens(text: string, modelId?: string): number {
  if (!text) return 0;

  // Get model-specific ratio or use default
  const ratio = modelId
    ? MODEL_TOKEN_RATIOS[modelId] || MODEL_TOKEN_RATIOS.default
    : MODEL_TOKEN_RATIOS.default;

  // Calculate token count
  return Math.ceil(text.length / ratio);
}

/**
 * Get expected token count for a specific agent/operation
 *
 * @param agentId - The agent or operation identifier
 * @returns Expected token count
 */
export function getExpectedTokenCount(agentId: string): number {
  return AGENT_EXPECTED_LENGTHS[agentId] || AGENT_EXPECTED_LENGTHS.default;
}

/**
 * Calculate progress percentage based on current and expected tokens
 *
 * @param currentTokens - Current token count
 * @param expectedTokens - Expected total token count
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentTokens: number, expectedTokens: number): number {
  if (expectedTokens === 0) return 0;
  return Math.min(Math.round((currentTokens / expectedTokens) * 100), 100);
}

/**
 * Estimate remaining time based on current progress
 *
 * @param currentTokens - Current token count
 * @param expectedTokens - Expected total token count
 * @param elapsedMs - Time elapsed so far in milliseconds
 * @returns Estimated remaining time in milliseconds
 */
export function estimateRemainingTime(
  currentTokens: number,
  expectedTokens: number,
  elapsedMs: number
): number {
  if (currentTokens === 0) return 0;

  const tokensPerMs = currentTokens / elapsedMs;
  const remainingTokens = Math.max(0, expectedTokens - currentTokens);

  return Math.ceil(remainingTokens / tokensPerMs);
}

/**
 * Format time duration in human-readable format
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2s", "1m 30s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate tokens per second rate
 *
 * @param tokenCount - Total tokens generated
 * @param durationMs - Duration in milliseconds
 * @returns Tokens per second
 */
export function calculateTokensPerSecond(tokenCount: number, durationMs: number): number {
  if (durationMs === 0) return 0;
  return Math.round((tokenCount / durationMs) * 1000);
}

/**
 * Get a user-friendly estimation summary
 *
 * @param currentTokens - Current token count
 * @param agentId - Agent identifier
 * @param elapsedMs - Time elapsed so far
 * @returns Summary object with progress and estimates
 */
export function getEstimationSummary(
  currentTokens: number,
  agentId: string,
  elapsedMs: number
): {
  progress: number;
  expectedTotal: number;
  remainingMs: number;
  tokensPerSecond: number;
  estimatedCompletion: string;
} {
  const expectedTotal = getExpectedTokenCount(agentId);
  const progress = calculateProgress(currentTokens, expectedTotal);
  const remainingMs = estimateRemainingTime(currentTokens, expectedTotal, elapsedMs);
  const tokensPerSecond = calculateTokensPerSecond(currentTokens, elapsedMs);

  return {
    progress,
    expectedTotal,
    remainingMs,
    tokensPerSecond,
    estimatedCompletion: formatDuration(remainingMs),
  };
}
