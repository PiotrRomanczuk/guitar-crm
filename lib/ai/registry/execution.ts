/**
 * Agent Execution Engine
 *
 * Core execution logic for AI agents
 */

import { getAIProvider, type AIMessage } from '@/lib/ai';
import { DEFAULT_AI_MODEL } from '@/lib/ai-models';
import type { AgentSpecification, AgentRequest, AgentResponse, AgentContext } from './types';
import { fetchContextData } from './context-fetcher';

/**
 * Execute an AI agent with given request and specification
 */
export async function executeAgent(
  request: AgentRequest,
  agent: AgentSpecification,
  executionContext: Record<string, any>
): Promise<any> {
  const provider = await getAIProvider();

  // Build system prompt with context
  const systemPrompt = buildSystemPrompt(agent, executionContext);

  // Build user message
  const userMessage = buildUserMessage(request.input, agent);

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  // Execute AI request
  const result = await provider.complete({
    model: request.overrides?.model || agent.model || DEFAULT_AI_MODEL,
    messages,
    temperature: request.overrides?.temperature || agent.temperature,
    maxTokens: agent.maxTokens,
  });

  return result;
}

/**
 * Prepare execution context by fetching required and optional context data
 */
export async function prepareContext(
  request: AgentRequest,
  agent: AgentSpecification
): Promise<Record<string, any>> {
  const context: Record<string, any> = {};

  // Fetch required context data
  for (const contextKey of agent.requiredContext) {
    try {
      context[contextKey] = await fetchContextData(contextKey, request.context);
    } catch (error) {
      throw new Error(
        `Failed to fetch required context '${contextKey}': ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // Fetch optional context data
  for (const contextKey of agent.optionalContext) {
    try {
      context[contextKey] = await fetchContextData(contextKey, request.context);
    } catch (error) {
      // Optional context failures are non-blocking
      console.warn(`[AgentExecution] Failed to fetch optional context: ${contextKey}`, error);
      context[contextKey] = null;
    }
  }

  return context;
}

/**
 * Build system prompt with injected context data
 */
function buildSystemPrompt(agent: AgentSpecification, context: Record<string, any>): string {
  let prompt = agent.systemPrompt;

  // Inject context variables
  for (const [key, value] of Object.entries(context)) {
    if (value !== null && value !== undefined) {
      const contextValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      prompt += `\n\n${key.toUpperCase()}: ${contextValue}`;
    }
  }

  return prompt;
}

/**
 * Build user message from input fields
 */
function buildUserMessage(input: Record<string, any>, agent: AgentSpecification): string {
  const messageParts: string[] = [];

  for (const field of agent.inputValidation.allowedFields) {
    if (input[field] !== undefined && input[field] !== null && input[field] !== '') {
      const fieldValue =
        typeof input[field] === 'object' ? JSON.stringify(input[field]) : String(input[field]);
      messageParts.push(`${field}: ${fieldValue}`);
    }
  }

  return messageParts.length > 0 ? messageParts.join('\n') : 'No specific input provided.';
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create hash of input data for analytics
 */
export function hashInput(input: Record<string, any>): string {
  try {
    return Buffer.from(JSON.stringify(input)).toString('base64').substr(0, 16);
  } catch (error) {
    return 'hash_error';
  }
}
