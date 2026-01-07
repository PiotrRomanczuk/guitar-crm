/**
 * Song Normalization Agent
 *
 * AI agent specialized in cleaning and normalizing song data for better
 * Spotify API matching, even with poor quality database entries.
 */

import { generateAIResponse } from '@/app/actions/ai';

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
 * Execute song normalization agent
 */
export async function generateSongNormalizationAgent(
  input: SongNormalizationInput
): Promise<{ success: boolean; data?: SongNormalizationResult; content?: string; error?: string }> {
  const prompt = `You are a music database expert specializing in cleaning and normalizing song data to improve matching accuracy with music services like Spotify. Your task is to analyze and enhance the provided song information.

### Input Song Data:
- **Title**: "${input.title}"
- **Artist**: "${input.artist}"
${input.album ? `- **Album**: "${input.album}"` : ''}
${input.year ? `- **Year**: ${input.year}` : ''}
${input.genre ? `- **Genre**: "${input.genre}"` : ''}

### Your Expertise Should Address:

1. **Common Data Issues**:
   - Typos and misspellings (e.g., "Coldpaly" → "Coldplay")
   - Inconsistent formatting (e.g., "Guns N Roses" vs "Guns N' Roses")
   - Missing/extra words (feat., featuring, vs, etc.)
   - Special characters (e.g., "Motörhead" vs "Motorhead")
   - Alternative artist names (solo vs band names)

2. **Music Industry Knowledge**:
   - Standard featuring/collaboration formats
   - Band name variations and evolution
   - Regional spelling differences
   - Common abbreviations and expansions

3. **Search Optimization**:
   - Generate multiple search query variations
   - Account for different platforms' naming conventions
   - Consider partial matches and fallback strategies

### Required Output:

Provide a detailed JSON response with the following structure:

\`\`\`json
{
  "normalizedTitle": "Clean, standardized song title",
  "normalizedArtist": "Clean, standardized artist name", 
  "alternativeTitles": [
    "Alternative title variation 1",
    "Alternative title variation 2"
  ],
  "alternativeArtists": [
    "Alternative artist name 1", 
    "Alternative artist name 2"
  ],
  "confidence": 85,
  "reasoning": "Detailed explanation of changes made and why",
  "searchQueries": [
    "track:\\"normalized title\\" artist:\\"normalized artist\\"",
    "normalized title normalized artist",
    "alternative search queries..."
  ],
  "flags": {
    "hasFeaturing": false,
    "hasTypos": true,
    "hasMissingWords": false,
    "hasSpecialCharacters": false,
    "needsManualReview": false
  }
}
\`\`\`

Focus on creating the most searchable and accurate representation of this song data.`;

  try {
    const response = await generateAIResponse(prompt);

    if (response.error || !response.content) {
      return {
        success: false,
        error: response.error || 'No response content',
      };
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(response.content) as SongNormalizationResult;
      return {
        success: true,
        data,
        content: response.content,
      };
    } catch {
      return {
        success: false,
        content: response.content,
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
