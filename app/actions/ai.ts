'use server';

import { getAIProvider, isAIError, type AIMessage, type AIModelInfo } from '@/lib/ai';
import { DEFAULT_AI_MODEL } from '@/lib/ai-models';

/**
 * Generate AI response using the configured provider
 * 
 * This action automatically selects between OpenRouter and local LLM
 * based on the AI_PROVIDER environment variable:
 * - 'openrouter': Use OpenRouter API
 * - 'ollama': Use local Ollama
 * - 'auto' (default): Try Ollama first, fallback to OpenRouter
 */
export async function generateAIResponse(
  prompt: string,
  model: string = DEFAULT_AI_MODEL
): Promise<{ content?: string; error?: string }> {
  try {
    // Get the configured provider
    const provider = await getAIProvider();
    
    console.log(`[AI] Using provider: ${provider.name}, model: ${model}`);

    // Check if provider is available
    const available = await provider.isAvailable();
    if (!available) {
      return {
        error: `${provider.name} is not available. Please check your configuration.`,
      };
    }

    // Prepare messages
    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant for the Guitar CRM admin dashboard. Keep your answers concise and relevant to managing a music school.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Generate completion
    const result = await provider.complete({
      model,
      messages,
      temperature: 0.7,
    });

    // Handle error response
    if (isAIError(result)) {
      console.error(`[AI] ${provider.name} error:`, result.error);
      return { error: result.error };
    }

    // Return success response
    return { content: result.content };
  } catch (error) {
    console.error('[AI] Unexpected error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to generate AI response.',
    };
  }
}

/**
 * Get available AI models from the current provider
 */
export async function getAvailableModels(): Promise<{
  models?: AIModelInfo[];
  providerName?: string;
  error?: string;
}> {
  try {
    const provider = await getAIProvider();
    const models = await provider.listModels();
    
    return {
      models,
      providerName: provider.name,
    };
  } catch (error) {
    console.error('[AI] Failed to fetch models:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch available models.',
    };
  }
}
