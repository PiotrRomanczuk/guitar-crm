/**
 * Types for the chord progression analysis feature.
 */

export interface ChordFrequency {
  chord: string;
  count: number;
  percentage: number;
}

export interface ChordTransition {
  from: string;
  to: string;
  count: number;
}

export interface ProgressionFrequency {
  progression: string;
  count: number;
  songs: string[];
}

export interface SongRomanAnalysis {
  songId: string;
  title: string;
  author: string | null;
  key: string;
  chords: string[];
  romanNumerals: string[];
  isDiatonic: boolean[];
  archetypes: string[];
}

export interface ProgressionLengthBucket {
  chordCount: number;
  songCount: number;
}

export interface ChordAnalysisData {
  /** Total songs that had valid chord + key data */
  songsAnalyzed: number;
  /** Total unique progression patterns found */
  uniqueProgressions: number;
  /** Number of archetype matches across all songs */
  archetypeMatches: number;
  /** Top chords by frequency */
  chordFrequencies: ChordFrequency[];
  /** Chord-to-chord transitions for heatmap */
  transitions: ChordTransition[];
  /** Most common full progressions */
  progressionFrequencies: ProgressionFrequency[];
  /** Per-song Roman numeral analysis */
  songAnalyses: SongRomanAnalysis[];
  /** Distribution of chord counts per song */
  progressionLengths: ProgressionLengthBucket[];
}
