/**
 * Pure computation service for chord progression analysis.
 * Transforms raw song rows into ChordAnalysisData.
 */

import { parseChordsColumn } from '@/lib/music-theory/chord-parser';
import { chordsToRomanNumerals } from '@/lib/music-theory/roman-numeral';
import { detectArchetypes } from '@/lib/music-theory/progression-archetypes';
import type {
  ChordAnalysisData,
  ChordFrequency,
  ChordTransition,
  ProgressionFrequency,
  SongRomanAnalysis,
  ProgressionLengthBucket,
} from '@/types/ChordAnalysis';

interface SongRow {
  id: string;
  title: string;
  author: string | null;
  key: string | null;
  chords: string | null;
}

function isValidSong(row: SongRow): boolean {
  return !!row.key && !!row.chords && row.key !== '';
}

function analyzeSong(row: SongRow): SongRomanAnalysis | null {
  if (!isValidSong(row)) return null;

  const parsed = parseChordsColumn(row.chords);
  if (parsed.length === 0) return null;

  const key = row.key!;
  const romanResults = chordsToRomanNumerals(parsed, key);
  const numerals = romanResults.map((r) => r.numeral);
  const archetypes = detectArchetypes(numerals);

  return {
    songId: row.id,
    title: row.title,
    author: row.author,
    key,
    chords: parsed.map((p) => p.raw),
    romanNumerals: numerals,
    isDiatonic: romanResults.map((r) => r.isDiatonic),
    archetypes: archetypes.map((a) => a.name),
  };
}

function computeChordFrequencies(analyses: SongRomanAnalysis[]): ChordFrequency[] {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const song of analyses) {
    for (const chord of song.chords) {
      counts[chord] = (counts[chord] ?? 0) + 1;
      total++;
    }
  }

  return Object.entries(counts)
    .map(([chord, count]) => ({
      chord,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function computeTransitions(analyses: SongRomanAnalysis[]): ChordTransition[] {
  const counts: Record<string, number> = {};

  for (const song of analyses) {
    for (let i = 0; i < song.chords.length - 1; i++) {
      const key = `${song.chords[i]}→${song.chords[i + 1]}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([key, count]) => {
      const [from, to] = key.split('→');
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count);
}

function computeProgressionFrequencies(analyses: SongRomanAnalysis[]): ProgressionFrequency[] {
  const map: Record<string, string[]> = {};

  for (const song of analyses) {
    const progression = song.romanNumerals.join(' - ');
    if (!map[progression]) map[progression] = [];
    map[progression].push(song.title);
  }

  return Object.entries(map)
    .map(([progression, songs]) => ({ progression, count: songs.length, songs }))
    .sort((a, b) => b.count - a.count);
}

function computeProgressionLengths(analyses: SongRomanAnalysis[]): ProgressionLengthBucket[] {
  const counts: Record<number, number> = {};

  for (const song of analyses) {
    const len = song.chords.length;
    counts[len] = (counts[len] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([chordCount, songCount]) => ({
      chordCount: Number(chordCount),
      songCount,
    }))
    .sort((a, b) => a.chordCount - b.chordCount);
}

/**
 * Main entry point: compute full chord analysis from raw DB rows.
 */
export function computeChordAnalysis(songs: SongRow[]): ChordAnalysisData {
  const songAnalyses = songs
    .map(analyzeSong)
    .filter((a): a is SongRomanAnalysis => a !== null);

  const chordFrequencies = computeChordFrequencies(songAnalyses);
  const transitions = computeTransitions(songAnalyses);
  const progressionFrequencies = computeProgressionFrequencies(songAnalyses);
  const progressionLengths = computeProgressionLengths(songAnalyses);

  const archetypeMatches = songAnalyses.reduce(
    (sum, s) => sum + s.archetypes.length,
    0
  );

  return {
    songsAnalyzed: songAnalyses.length,
    uniqueProgressions: progressionFrequencies.length,
    archetypeMatches,
    chordFrequencies,
    transitions,
    progressionFrequencies,
    songAnalyses,
    progressionLengths,
  };
}
