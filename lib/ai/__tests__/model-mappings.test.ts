/**
 * Model Mappings Tests [BMS-115]
 *
 * Tests for AI model mapping between OpenRouter and Ollama providers.
 */

import {
  mapToOllamaModel,
  mapToOpenRouterModel,
  getAllModelMappings,
  FALLBACK_MODELS,
} from '../model-mappings';

describe('mapToOllamaModel', () => {
  it('should map known OpenRouter models to Ollama equivalents', () => {
    expect(mapToOllamaModel('meta-llama/llama-3.3-70b-instruct:free')).toBe('llama3.2:3b');
    expect(mapToOllamaModel('mistralai/mistral-7b-instruct:free')).toBe('mistral:7b');
    expect(mapToOllamaModel('google/gemma-3-27b-it:free')).toBe('gemma2:27b');
  });

  it('should return fallback model for unknown OpenRouter models', () => {
    expect(mapToOllamaModel('unknown/model:free')).toBe(FALLBACK_MODELS.ollama);
    expect(mapToOllamaModel('')).toBe(FALLBACK_MODELS.ollama);
    expect(mapToOllamaModel('not-a-real-model')).toBe(FALLBACK_MODELS.ollama);
  });
});

describe('mapToOpenRouterModel', () => {
  it('should map known Ollama models to OpenRouter equivalents', () => {
    expect(mapToOpenRouterModel('llama3.2:3b')).toBe('meta-llama/llama-3.3-70b-instruct:free');
    expect(mapToOpenRouterModel('mistral:7b')).toBe('google/gemini-2.0-flash-exp:free');
  });

  it('should return fallback model for unknown Ollama models', () => {
    expect(mapToOpenRouterModel('unknown-model')).toBe(FALLBACK_MODELS.openrouter);
    expect(mapToOpenRouterModel('')).toBe(FALLBACK_MODELS.openrouter);
  });
});

describe('getAllModelMappings', () => {
  it('should return all model mappings', () => {
    const mappings = getAllModelMappings();
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings[0]).toHaveProperty('openrouterModel');
    expect(mappings[0]).toHaveProperty('ollamaModel');
  });

  it('should return a copy (not the original array)', () => {
    const mappings1 = getAllModelMappings();
    const mappings2 = getAllModelMappings();
    expect(mappings1).not.toBe(mappings2);
    expect(mappings1).toEqual(mappings2);
  });
});
