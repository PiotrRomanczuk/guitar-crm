/**
 * AI Provider Factory
 *
 * Central factory for creating and managing AI providers.
 * Supports easy switching between OpenRouter, local models, and future providers.
 */

import type { AIProvider } from './types';
import { createOpenRouterProvider } from './providers/openrouter';
import { createOllamaProvider } from './providers/ollama';

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

// Functional implementation

/**
 * Creates the default factory configuration
 */
const createDefaultFactoryConfig = (): ProviderFactoryConfig => {
  const providerType = (process.env.AI_PROVIDER?.toLowerCase() || 'auto') as ProviderType;
  const preferLocal = process.env.AI_PREFER_LOCAL === 'true';

  return {
    provider: providerType,
    preferLocal,
  };
};

// Module-level state for singleton pattern in functional approach
let factoryConfig: ProviderFactoryConfig = createDefaultFactoryConfig();
let cachedProvider: AIProvider | null = null;

/**
 * Updates factory configuration
 */
const updateFactoryConfig = (config: Partial<ProviderFactoryConfig>): void => {
  factoryConfig = { ...factoryConfig, ...config };
  cachedProvider = null; // Clear cache when config changes
};

/**
 * Automatically selects the best available provider
 */
const autoSelectProvider = async (): Promise<AIProvider> => {
  const ollama = createOllamaProvider();
  const openrouter = createOpenRouterProvider();

  // If prefer local, try Ollama first
  if (factoryConfig.preferLocal !== false) {
    const ollamaAvailable = await ollama.isAvailable();
    if (ollamaAvailable) {
      return ollama;
    }
  }

  // Try OpenRouter
  const openrouterAvailable = await openrouter.isAvailable();
  if (openrouterAvailable) {
    return openrouter;
  }

  // If prefer local is false, try Ollama as fallback
  if (factoryConfig.preferLocal === false) {
    const ollamaAvailable = await ollama.isAvailable();
    if (ollamaAvailable) {
      return ollama;
    }
  }

  // Default to OpenRouter even if not configured (will show error to user)
  console.warn('[AIProviderFactory] No providers available, defaulting to OpenRouter');
  return openrouter;
};

/**
 * Gets the current provider based on configuration
 */
const getProvider = async (): Promise<AIProvider> => {
  // Return cached provider if available
  if (cachedProvider) {
    return cachedProvider;
  }

  let provider: AIProvider;

  switch (factoryConfig.provider) {
    case 'ollama':
      provider = createOllamaProvider();
      break;

    case 'openrouter':
      provider = createOpenRouterProvider();
      break;

    case 'auto':
    default:
      provider = await autoSelectProvider();
      break;
  }

  // Cache the provider
  cachedProvider = provider;
  return provider;
};

/**
 * Gets list of all available providers
 */
const getAvailableProviders = async (): Promise<Array<{ name: string; available: boolean }>> => {
  const ollama = createOllamaProvider();
  const openrouter = createOpenRouterProvider();

  const [ollamaAvailable, openrouterAvailable] = await Promise.all([
    ollama.isAvailable(),
    openrouter.isAvailable(),
  ]);

  return [
    { name: 'Ollama (Local)', available: ollamaAvailable },
    { name: 'OpenRouter (Cloud)', available: openrouterAvailable },
  ];
};

/**
 * Clears cached provider (forces re-selection on next getProvider call)
 */
const clearProviderCache = (): void => {
  cachedProvider = null;
};

/**
 * Gets the current factory configuration
 */
const getFactoryConfig = (): ProviderFactoryConfig => {
  return { ...factoryConfig };
};

/**
 * Factory object with all provider factory functions
 */
export const createProviderFactory = () => {
  return {
    updateConfig: updateFactoryConfig,
    getProvider,
    getAvailableProviders,
    clearCache: clearProviderCache,
    getConfig: getFactoryConfig,
  };
};

// Backward compatibility - Class wrapper around functional implementation
export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private factory = createProviderFactory();

  private constructor() {
    // Initialization is handled by the functional implementation
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
    this.factory.updateConfig(config);
  }

  /**
   * Get the current provider based on configuration
   */
  async getProvider(): Promise<AIProvider> {
    return this.factory.getProvider();
  }

  /**
   * Get list of all available providers
   */
  async getAvailableProviders(): Promise<Array<{ name: string; available: boolean }>> {
    return this.factory.getAvailableProviders();
  }

  /**
   * Clear cached provider (forces re-selection on next getProvider call)
   */
  clearCache(): void {
    this.factory.clearCache();
  }
}

/**
 * Convenience function to get the current AI provider
 */
export async function getAIProvider(): Promise<AIProvider> {
  return getProvider();
}
