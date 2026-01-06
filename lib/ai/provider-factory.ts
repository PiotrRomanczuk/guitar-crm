/**
 * AI Provider Factory
 * 
 * Central factory for creating and managing AI providers.
 * Supports easy switching between OpenRouter, local models, and future providers.
 */

import type { AIProvider } from './types';
import { OpenRouterProvider } from './providers/openrouter';
import { OllamaProvider } from './providers/ollama';

export type ProviderType = 'openrouter' | 'ollama' | 'auto';

/**
 * Configuration for the AI provider system
 */
export interface ProviderFactoryConfig {
  /**
   * Which provider to use
   * - 'openrouter': Use OpenRouter.ai API
   * - 'ollama': Use local Ollama instance
   * - 'auto': Try Ollama first, fallback to OpenRouter
   */
  provider: ProviderType;

  /**
   * Prefer local models when available
   * Only used when provider is 'auto'
   */
  preferLocal?: boolean;
}

/**
 * Factory class for creating AI providers
 */
export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private config: ProviderFactoryConfig;
  private cachedProvider: AIProvider | null = null;

  private constructor() {
    // Read config from environment variables
    const providerType = (process.env.AI_PROVIDER?.toLowerCase() || 'auto') as ProviderType;
    const preferLocal = process.env.AI_PREFER_LOCAL === 'true';

    this.config = {
      provider: providerType,
      preferLocal,
    };

    console.log('[AIProviderFactory] Initialized with config:', this.config);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  /**
   * Update factory configuration
   */
  updateConfig(config: Partial<ProviderFactoryConfig>): void {
    this.config = { ...this.config, ...config };
    this.cachedProvider = null; // Clear cache when config changes
    console.log('[AIProviderFactory] Config updated:', this.config);
  }

  /**
   * Get the current provider based on configuration
   */
  async getProvider(): Promise<AIProvider> {
    // Return cached provider if available
    if (this.cachedProvider) {
      return this.cachedProvider;
    }

    let provider: AIProvider;

    switch (this.config.provider) {
      case 'ollama':
        provider = new OllamaProvider();
        console.log('[AIProviderFactory] Using Ollama provider');
        break;

      case 'openrouter':
        provider = new OpenRouterProvider();
        console.log('[AIProviderFactory] Using OpenRouter provider');
        break;

      case 'auto':
      default:
        provider = await this.autoSelectProvider();
        break;
    }

    // Cache the provider
    this.cachedProvider = provider;
    return provider;
  }

  /**
   * Automatically select the best available provider
   */
  private async autoSelectProvider(): Promise<AIProvider> {
    const ollama = new OllamaProvider();
    const openrouter = new OpenRouterProvider();

    // If prefer local, try Ollama first
    if (this.config.preferLocal !== false) {
      const ollamaAvailable = await ollama.isAvailable();
      if (ollamaAvailable) {
        console.log('[AIProviderFactory] Auto-selected Ollama (local available)');
        return ollama;
      }
    }

    // Try OpenRouter
    const openrouterAvailable = await openrouter.isAvailable();
    if (openrouterAvailable) {
      console.log('[AIProviderFactory] Auto-selected OpenRouter');
      return openrouter;
    }

    // If prefer local is false, try Ollama as fallback
    if (this.config.preferLocal === false) {
      const ollamaAvailable = await ollama.isAvailable();
      if (ollamaAvailable) {
        console.log('[AIProviderFactory] Auto-selected Ollama (fallback)');
        return ollama;
      }
    }

    // Default to OpenRouter even if not configured (will show error to user)
    console.warn('[AIProviderFactory] No providers available, defaulting to OpenRouter');
    return openrouter;
  }

  /**
   * Get list of all available providers
   */
  async getAvailableProviders(): Promise<Array<{ name: string; available: boolean }>> {
    const ollama = new OllamaProvider();
    const openrouter = new OpenRouterProvider();

    const [ollamaAvailable, openrouterAvailable] = await Promise.all([
      ollama.isAvailable(),
      openrouter.isAvailable(),
    ]);

    return [
      { name: 'Ollama (Local)', available: ollamaAvailable },
      { name: 'OpenRouter (Cloud)', available: openrouterAvailable },
    ];
  }

  /**
   * Clear cached provider (forces re-selection on next getProvider call)
   */
  clearCache(): void {
    this.cachedProvider = null;
  }
}

/**
 * Convenience function to get the current AI provider
 */
export async function getAIProvider(): Promise<AIProvider> {
  return AIProviderFactory.getInstance().getProvider();
}
