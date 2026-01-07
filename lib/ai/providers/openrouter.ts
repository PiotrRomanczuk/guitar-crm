/**
 * OpenRouter AI Provider
 *
 * Implements the AIProvider interface for OpenRouter.ai service
 */

import type {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AIResult,
  AIModelInfo,
} from '../types';

// Functional implementation

/**
 * Creates the default configuration for OpenRouter provider
 */
const createDefaultConfig = (config?: Partial<AIProviderConfig>): AIProviderConfig => ({
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: 30000,
  maxRetries: 3,
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    'X-Title': 'Guitar CRM',
  },
  ...config,
});

/**
 * Lists available models
 */
const listModels = async (): Promise<AIModelInfo[]> => {
  // Return the predefined free models
  // In a full implementation, this could fetch from OpenRouter's models API
  return FREE_OPENROUTER_MODELS;
};

/**
 * Performs completion using OpenRouter API
 */
const complete = async (
  config: AIProviderConfig,
  request: AICompletionRequest
): Promise<AIResult> => {
  if (!config.apiKey) {
    return { error: 'OpenRouter API key is not configured.' };
  }

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: request.stream || false,
      }),
      signal: AbortSignal.timeout(config.timeout || 30000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[OpenRouter] API Error:', errorData);
      return {
        error: `OpenRouter API Error: ${response.statusText}`,
        code: String(response.status),
        details: errorData,
      };
    }

    const data = await response.json();

    return {
      content: data.choices?.[0]?.message?.content || '',
      finishReason: data.choices?.[0]?.finish_reason,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined,
    };
  } catch (error) {
    console.error('[OpenRouter] Request failed:', error);

    if (error instanceof Error) {
      return {
        error: `Failed to connect to OpenRouter: ${error.message}`,
        details: error,
      };
    }

    return { error: 'Failed to connect to OpenRouter service.' };
  }
};

/**
 * Checks if OpenRouter is available
 */
const isAvailable = async (config: AIProviderConfig): Promise<boolean> => {
  return !!config.apiKey;
};

/**
 * Factory function to create an OpenRouter provider instance
 */
export const createOpenRouterProvider = (config?: Partial<AIProviderConfig>): AIProvider => {
  const providerConfig = createDefaultConfig(config);

  return {
    name: 'OpenRouter' as const,
    listModels: () => listModels(),
    complete: (request: AICompletionRequest) => complete(providerConfig, request),
    isAvailable: () => isAvailable(providerConfig),
    getConfig: () => ({ ...providerConfig }),
  };
};

// Backward compatibility - Class wrapper around functional implementation
export class OpenRouterProvider implements AIProvider {
  readonly name = 'OpenRouter';
  private provider: AIProvider;

  constructor(config?: Partial<AIProviderConfig>) {
    this.provider = createOpenRouterProvider(config);
  }

  async listModels(): Promise<AIModelInfo[]> {
    return this.provider.listModels();
  }

  async complete(request: AICompletionRequest): Promise<AIResult> {
    return this.provider.complete(request);
  }

  async isAvailable(): Promise<boolean> {
    return this.provider.isAvailable();
  }

  getConfig(): AIProviderConfig {
    return this.provider.getConfig();
  }
}

// Free models available on OpenRouter
const FREE_OPENROUTER_MODELS: AIModelInfo[] = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    description:
      "Meta's highly capable open model, comparable to GPT-4 class models. Excellent for complex tasks.",
    bestFor: ['Complex reasoning', 'Coding', 'Creative writing', 'Nuanced instruction following'],
    contextWindow: 128000,
    isFree: true,
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'Google',
    description:
      "Google's latest experimental multimodal model. Fast and capable, but may be rate-limited.",
    bestFor: ['General purpose', 'Multimodal tasks', 'Complex reasoning'],
    contextWindow: 1048576,
    isFree: true,
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B Instruct',
    provider: 'Google',
    description:
      "Google's latest open model, offering improved math, reasoning, and chat capabilities.",
    bestFor: ['Reasoning', 'Math', 'Chat', 'Structured outputs'],
    contextWindow: 128000,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct',
    provider: 'Meta',
    description: 'A lightweight, efficient model from Meta, optimized for speed and low latency.',
    bestFor: ['Simple queries', 'Chatbots', 'Summarization', 'Fast responses'],
    contextWindow: 131072,
    isFree: true,
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct',
    provider: 'Mistral AI',
    description: 'A high-performing, industry-standard 7B model. Reliable and fast.',
    bestFor: ['General tasks', 'Text generation', 'Basic reasoning'],
    contextWindow: 32768,
    isFree: true,
  },
  {
    id: 'qwen/qwen-2.5-vl-7b-instruct:free',
    name: 'Qwen 2.5 VL 7B Instruct',
    provider: 'Qwen',
    description:
      'A capable multimodal model from Alibaba Cloud, good for visual understanding and general text.',
    bestFor: ['Vision tasks', 'General chat', 'Multilingual support'],
    contextWindow: 32768,
    isFree: true,
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    description: "DeepSeek's reasoning model. Excellent for logic and code.",
    bestFor: ['Coding', 'Math', 'Complex Logic', 'Reasoning'],
    contextWindow: 163840,
    isFree: true,
  },
];
