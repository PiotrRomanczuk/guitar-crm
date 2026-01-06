/**
 * Ollama Local LLM Provider
 * 
 * Implements the AIProvider interface for local Ollama instances
 * Ollama must be running locally (default: http://localhost:11434)
 */

import type {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AIResult,
  AIModelInfo,
} from '../types';

export class OllamaProvider implements AIProvider {
  readonly name = 'Ollama';
  private config: AIProviderConfig;

  constructor(config?: Partial<AIProviderConfig>) {
    this.config = {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      timeout: 60000, // Longer timeout for local models
      maxRetries: 2,
      ...config,
    };
  }

  async listModels(): Promise<AIModelInfo[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error('[Ollama] Failed to fetch models');
        return LOCAL_FALLBACK_MODELS;
      }

      const data = await response.json();
      
      // Transform Ollama model format to our AIModelInfo format
      return (data.models || []).map((model: any) => ({
        id: model.name,
        name: model.name,
        provider: 'Ollama',
        description: `Local model: ${model.name}`,
        bestFor: ['Local inference', 'Privacy', 'No API costs'],
        contextWindow: 4096, // Default, could be parsed from model details
        isFree: true,
        isLocal: true,
      }));
    } catch (error) {
      console.error('[Ollama] Error listing models:', error);
      return LOCAL_FALLBACK_MODELS;
    }
  }

  async complete(request: AICompletionRequest): Promise<AIResult> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: false,
          options: {
            temperature: request.temperature || 0.7,
            num_predict: request.maxTokens,
          },
        }),
        signal: AbortSignal.timeout(this.config.timeout || 60000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[Ollama] API Error:', errorText);
        return {
          error: `Ollama API Error: ${response.statusText}`,
          code: String(response.status),
          details: errorText,
        };
      }

      const data = await response.json();
      
      return {
        content: data.message?.content || '',
        finishReason: data.done ? 'stop' : 'length',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      console.error('[Ollama] Request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: 'Request timeout - the model took too long to respond',
            details: error,
          };
        }
        return {
          error: `Failed to connect to Ollama: ${error.message}`,
          details: error,
        };
      }
      
      return {
        error: 'Failed to connect to Ollama. Make sure Ollama is running locally.',
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getConfig(): AIProviderConfig {
    return { ...this.config };
  }
}

// Common local models to suggest if Ollama is available
const LOCAL_FALLBACK_MODELS: AIModelInfo[] = [
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    provider: 'Ollama',
    description: 'Meta\'s Llama 3.2 - balanced performance and speed',
    bestFor: ['General purpose', 'Fast responses', 'Local privacy'],
    contextWindow: 128000,
    isFree: true,
    isLocal: true,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'Ollama',
    description: 'Mistral 7B - efficient and capable',
    bestFor: ['General tasks', 'Coding', 'Fast inference'],
    contextWindow: 32768,
    isFree: true,
    isLocal: true,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'Ollama',
    description: 'DeepSeek R1 - reasoning focused',
    bestFor: ['Reasoning', 'Math', 'Complex logic'],
    contextWindow: 163840,
    isFree: true,
    isLocal: true,
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    provider: 'Ollama',
    description: 'Qwen 2.5 - multilingual support',
    bestFor: ['Multilingual', 'General chat', 'Code generation'],
    contextWindow: 32768,
    isFree: true,
    isLocal: true,
  },
];
