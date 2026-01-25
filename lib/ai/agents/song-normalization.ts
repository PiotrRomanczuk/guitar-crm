/**
 * Song Normalization Agent
 *
 * AI agent specialized in cleaning and normalizing song data for better
 * Spotify API matching, even with poor quality database entries.
 */

import type { AgentSpecification } from '../agent-registry';
import { executeAgent } from '../agent-registry';

export interface SongNormalizationInput {
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string;
}

export interface SongNormalizationResult {
  normalizedTitle: string;
  normalizedArtist: string;
  alternativeTitles: string[];
  alternativeArtists: string[];
  confidence: number;
  reasoning: string;
  searchQueries: string[];
  flags: {
    hasFeaturing: boolean;
    hasTypos: boolean;
    hasMissingWords: boolean;
    hasSpecialCharacters: boolean;
    needsManualReview: boolean;
  };
}

/**
 * Song Normalization Agent Specification
 */
export const songNormalizationAgent: AgentSpecification = {
  id: 'song-normalization',
  name: 'Song Data Normalization Agent',
  description: 'Cleans and normalizes song data for better Spotify API matching',
  version: '1.0.0',

  purpose:
    'Clean and normalize messy song database entries to improve matching accuracy with music services like Spotify',

  targetUsers: ['system'],

  useCases: [
    'Clean typos in song titles and artist names',
    'Handle featuring artists and collaborations',
    'Normalize special characters and punctuation',
    'Generate alternative search queries',
    'Identify songs that need manual review',
  ],

  limitations: [
    'Cannot identify songs with completely wrong metadata',
    'May suggest corrections that change artistic intent',
    'Requires sufficient context to make accurate suggestions',
  ],

  systemPrompt: `You are a music database expert specializing in cleaning and normalizing song data to improve matching accuracy with music services like Spotify. Your task is to analyze and enhance the provided song information.

Your expertise should address:
- Correcting common typos and spelling errors
- Handling featuring artists properly (feat., ft., with, etc.)
- Normalizing punctuation and special characters
- Identifying missing words or incomplete titles
- Generating alternative search variations
- Providing confidence scores for suggested changes

Always respond with valid JSON matching the specified schema.`,

  temperature: 0.3,
  maxTokens: 800,

  requiredContext: [],
  optionalContext: [],

  inputValidation: {
    maxLength: 1000,
    allowedFields: ['title', 'artist', 'album', 'year', 'genre'],
    sensitiveDataHandling: 'sanitize',
  },

  enableLogging: true,
  enableAnalytics: false,

  dataAccess: {
    tables: ['songs'],
    permissions: ['read', 'write'],
  },

  successMetrics: ['normalization_confidence', 'data_quality_improvement'],

  uiConfig: {
    category: 'automation',
    icon: 'music',
    placement: ['dashboard'], // Admin dashboard
  },
};

/**
 * Execute song normalization agent
 */
export async function generateSongNormalizationAgent(
  input: SongNormalizationInput
): Promise<{ success: boolean; data?: SongNormalizationResult; content?: string; error?: string }> {
  try {
    const userInput = `
Input Song Data:
- Title: "${input.title}"
- Artist: "${input.artist}"
${input.album ? `- Album: "${input.album}"` : ''}
${input.year ? `- Year: ${input.year}` : ''}
${input.genre ? `- Genre: "${input.genre}"` : ''}

Please analyze and normalize this song data, providing a JSON response with cleaned titles, artists, alternatives, confidence score, reasoning, search queries, and flags for data issues.
`;

    const response = await executeAgent('song-normalization', userInput);

    if (!response || response.error) {
      return {
        success: false,
        error: response?.error || 'No response from agent',
      };
    }

    const content = response.content || response.result || response;

    // Try to parse as JSON
    try {
      const data = JSON.parse(String(content)) as SongNormalizationResult;
      return {
        success: true,
        data,
        content: String(content),
      };
    } catch {
      return {
        success: false,
        content: String(content),
        error: 'Failed to parse JSON response',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch normalize multiple songs
 */
export async function generateBatchSongNormalization(
  songs: SongNormalizationInput[],
  onProgress?: (completed: number, total: number) => void
): Promise<(SongNormalizationResult | null)[]> {
  const results: (SongNormalizationResult | null)[] = [];

  for (let i = 0; i < songs.length; i++) {
    try {
      const result = await generateSongNormalizationAgent(songs[i]);
      results.push(result.success ? result.data || null : null);

      if (onProgress) {
        onProgress(i + 1, songs.length);
      }

      // Small delay to be nice to API
      if (i < songs.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (error) {
      console.error(`Failed to normalize song ${i}:`, error);
      results.push(null);
    }
  }

  return results;
}

/**
 * Helper to extract normalized data from agent response
 */
export function extractNormalizationData(response: {
  success: boolean;
  data?: SongNormalizationResult;
  content?: string;
  error?: string;
}): SongNormalizationResult | null {
  if (response.success && response.data) {
    return response.data;
  }

  // Try to extract from content if data is missing
  if (response.success && response.content) {
    try {
      const parsed = JSON.parse(response.content);
      return parsed as SongNormalizationResult;
    } catch (error) {
      console.error('Failed to parse normalization response:', error);
      return null;
    }
  }

  return null;
}

/**
 * Create fallback normalization for when AI fails
 */
export function createFallbackNormalization(
  input: SongNormalizationInput
): SongNormalizationResult {
  // Basic cleaning
  const normalizedTitle = input.title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[""'']/g, '"')
    .replace(/[–—]/g, '-');

  const normalizedArtist = input.artist
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bfeat\.?\b/gi, 'featuring')
    .replace(/\bft\.?\b/gi, 'featuring');

  return {
    normalizedTitle,
    normalizedArtist,
    alternativeTitles: [],
    alternativeArtists: [],
    confidence: 40, // Low confidence for fallback
    reasoning: 'AI normalization failed, using basic cleaning only',
    searchQueries: [
      `track:"${normalizedTitle}" artist:"${normalizedArtist}"`,
      `${normalizedTitle} ${normalizedArtist}`,
      `"${normalizedTitle}"`,
      `artist:"${normalizedArtist}"`,
    ],
    flags: {
      hasFeaturing:
        /feat\.?|featuring/i.test(input.title) || /feat\.?|featuring/i.test(input.artist),
      hasTypos: false, // Can't detect without AI
      hasMissingWords: false,
      hasSpecialCharacters:
        /[^\w\s\-\'".,!?()]/.test(input.title) || /[^\w\s\-\'".,!?()]/.test(input.artist),
      needsManualReview: true,
    },
  };
}
