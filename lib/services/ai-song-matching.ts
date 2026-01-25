/**
 * AI-Powered Song Matching Service
 *
 * Uses AI and fuzzy matching to intelligently match database songs with Spotify tracks,
 * even when the database has poor quality, inconsistent, or "terrible" data.
 */

// AI response handling is now done through the song normalization agent
import type { Database } from '@/database.types';

type DatabaseSong = Database['public']['Tables']['songs']['Row'];

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    release_date: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
}

export interface SongMatchResult {
  confidence: number; // 0-100
  found: boolean;
  track?: SpotifyTrack;
  spotifyTrack?: SpotifyTrack; // Keep for backward compatibility
  searchQuery: string;
  reason?: string;
  reasoning: string;
  suggestions?: string[];
}

export interface AIAnalysisResult {
  normalizedTitle: string;
  normalizedArtist: string;
  alternativeTitles: string[];
  alternativeArtists: string[];
  confidence: number;
  reasoning: string;
}

/**
 * Normalize song data using AI to handle poor quality database entries
 */
export async function analyzeAndNormalizeSong(song: DatabaseSong): Promise<AIAnalysisResult> {
  try {
    // Import the AI agent
    const {
      generateSongNormalizationAgent,
      extractNormalizationData,
      createFallbackNormalization,
    } = await import('@/lib/ai/agents/song-normalization');

    console.log(`🤖 AI analyzing: "${song.title}" by "${song.author}"`);

    // Use the dedicated song normalization agent
    const response = await generateSongNormalizationAgent({
      title: song.title,
      artist: song.author || '',
      album: undefined, // Could be added if available in schema
      year: song.release_year || undefined,
      genre: song.category || undefined,
    });

    const normalizationData = extractNormalizationData(response);

    if (normalizationData) {
      console.log(
        `🤖 AI success: ${normalizationData.confidence}% confidence - ${normalizationData.reasoning}`
      );

      return {
        normalizedTitle: normalizationData.normalizedTitle,
        normalizedArtist: normalizationData.normalizedArtist,
        alternativeTitles: normalizationData.alternativeTitles,
        alternativeArtists: normalizationData.alternativeArtists,
        confidence: normalizationData.confidence,
        reasoning: normalizationData.reasoning,
      };
    } else {
      console.warn(`🤖 AI response parsing failed, using fallback`);

      // Use fallback normalization
      const fallback = createFallbackNormalization({
        title: song.title,
        artist: song.author || '',
      });

      return {
        normalizedTitle: fallback.normalizedTitle,
        normalizedArtist: fallback.normalizedArtist,
        alternativeTitles: fallback.alternativeTitles,
        alternativeArtists: fallback.alternativeArtists,
        confidence: fallback.confidence,
        reasoning: fallback.reasoning,
      };
    }
  } catch (error) {
    console.error('AI song analysis error:', error);

    // Fallback to simple normalization
    return {
      normalizedTitle: normalizeTitleSimple(song.title),
      normalizedArtist: normalizeArtistSimple(song.author || ''),
      alternativeTitles: [],
      alternativeArtists: [],
      confidence: 40,
      reasoning: `AI error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }. Using fallback normalization.`,
    };
  }
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '');
  const a = normalize(str1);
  const b = normalize(str2);

  if (a === b) return 100;

  const matrix: number[][] = [];
  const len1 = a.length;
  const len2 = b.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (a.charAt(i - 1) === b.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  const maxLength = Math.max(len1, len2);
  const similarity = maxLength === 0 ? 100 : ((maxLength - matrix[len1][len2]) / maxLength) * 100;

  return Math.round(similarity);
}

/**
 * Generate multiple search queries for Spotify API
 */
export function generateSearchQueries(analysis: AIAnalysisResult): string[] {
  const queries: string[] = [];

  // Primary normalized query
  queries.push(`track:"${analysis.normalizedTitle}" artist:"${analysis.normalizedArtist}"`);

  // Simple combined query
  queries.push(`${analysis.normalizedTitle} ${analysis.normalizedArtist}`);

  // Alternative titles with main artist
  analysis.alternativeTitles.forEach((title) => {
    queries.push(`track:"${title}" artist:"${analysis.normalizedArtist}"`);
    queries.push(`${title} ${analysis.normalizedArtist}`);
  });

  // Alternative artists with main title
  analysis.alternativeArtists.forEach((artist) => {
    queries.push(`track:"${analysis.normalizedTitle}" artist:"${artist}"`);
    queries.push(`${analysis.normalizedTitle} ${artist}`);
  });

  // Cross combinations of alternatives
  if (analysis.alternativeTitles.length > 0 && analysis.alternativeArtists.length > 0) {
    analysis.alternativeTitles.slice(0, 2).forEach((title) => {
      analysis.alternativeArtists.slice(0, 2).forEach((artist) => {
        queries.push(`${title} ${artist}`);
      });
    });
  }

  // Partial matches (title only, artist only)
  queries.push(`"${analysis.normalizedTitle}"`);
  queries.push(`artist:"${analysis.normalizedArtist}"`);

  // Remove duplicates and limit to 10 queries
  return [...new Set(queries)].slice(0, 10);
}

/**
 * Score a Spotify track match against the original song
 */
export function scoreMatch(
  originalSong: DatabaseSong,
  spotifyTrack: SpotifyTrack,
  analysis: AIAnalysisResult
): number {
  let score = 0;

  // Title similarity (40% weight)
  const titleSimilarity = Math.max(
    calculateSimilarity(originalSong.title, spotifyTrack.name),
    calculateSimilarity(analysis.normalizedTitle, spotifyTrack.name),
    ...analysis.alternativeTitles.map((alt) => calculateSimilarity(alt, spotifyTrack.name))
  );
  score += titleSimilarity * 0.4;

  // Artist similarity (40% weight)
  const artistNames = spotifyTrack.artists.map((a) => a.name).join(' ');
  const artistSimilarity = Math.max(
    calculateSimilarity(originalSong.author || '', artistNames),
    calculateSimilarity(analysis.normalizedArtist, artistNames),
    ...analysis.alternativeArtists.map((alt) => calculateSimilarity(alt, artistNames))
  );
  score += artistSimilarity * 0.4;

  // Spotify popularity boost (10% weight)
  score += Math.min(spotifyTrack.popularity, 100) * 0.1;

  // AI confidence boost (10% weight)
  score += analysis.confidence * 0.1;

  return Math.round(Math.min(score, 100));
}

/**
 * Simple title normalization fallback
 */
function normalizeTitleSimple(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[""'']/g, '"')
    .replace(/[–—]/g, '-')
    .toLowerCase();
}

/**
 * Simple artist normalization fallback
 */
function normalizeArtistSimple(artist: string): string {
  return artist
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bfeat\.?\b/gi, 'featuring')
    .replace(/\bft\.?\b/gi, 'featuring')
    .toLowerCase();
}

/**
 * Extract information from AI text response when JSON parsing fails
 */
function extractInfoFromText(content: string, originalSong: DatabaseSong): AIAnalysisResult {
  const lines = content.toLowerCase().split('\n');

  let normalizedTitle = originalSong.title;
  let normalizedArtist = originalSong.author || '';

  // Look for patterns in the text
  for (const line of lines) {
    if (line.includes('title:') || line.includes('song:')) {
      const match = line.match(/(?:title:|song:)\s*["']?([^"'\n]+)["']?/);
      if (match) normalizedTitle = match[1].trim();
    }

    if (line.includes('artist:') || line.includes('by:')) {
      const match = line.match(/(?:artist:|by:)\s*["']?([^"'\n]+)["']?/);
      if (match) normalizedArtist = match[1].trim();
    }
  }

  return {
    normalizedTitle: normalizedTitle || normalizeTitleSimple(originalSong.title),
    normalizedArtist: normalizedArtist || normalizeArtistSimple(originalSong.author || ''),
    alternativeTitles: [],
    alternativeArtists: [],
    confidence: 60,
    reasoning: 'Extracted from AI text response',
  };
}
