import { calculateSimilarity } from '@/lib/utils/string-similarity';
import { DriveFileInfo } from './google-drive-service-account';

export interface ParsedFilename {
  title: string;
  artist: string | null;
  raw: string;
}

export type MatchStatus = 'matched' | 'ambiguous' | 'unmatched';

export interface SongRecord {
  id: string;
  title: string;
  author: string;
}

export interface VideoMatchResult {
  driveFile: DriveFileInfo;
  parsed: ParsedFilename;
  bestMatch: { song: SongRecord; score: number } | null;
  runnerUp: { song: SongRecord; score: number } | null;
  status: MatchStatus;
}

const MATCHED_THRESHOLD = 75;
const AMBIGUOUS_THRESHOLD = 60;
const RUNNER_UP_GAP = 10;

/**
 * Parse a video filename into title + optional artist.
 * Handles patterns like:
 *   "01 - Hotel California - Eagles.mp4"
 *   "Wonderwall - Oasis.mp4"
 *   "Blackbird.mp4"
 *   "Hit the road Jack - toCut.mov" → strips suffix
 *   "Miec czy byc - 129BPM.mov"    → strips suffix
 */
export function parseVideoFilename(filename: string): ParsedFilename {
  // Strip extension
  const raw = filename.replace(/\.[^.]+$/, '');

  // Remove leading track numbers like "01 - ", "01. ", "1 "
  const withoutTrackNum = raw.replace(/^\d{1,3}[\s.\-_]+/, '');

  // Split on common separators: " - ", " – ", " — "
  const parts = withoutTrackNum.split(/\s*[-–—]\s*/);

  if (parts.length >= 2) {
    const candidateArtist = parts[parts.length - 1].trim();
    // Check if the last part is a non-artist suffix (edit note, speed, BPM, etc.)
    if (isFileSuffix(candidateArtist)) {
      // Drop suffix, rejoin remaining parts as title
      const titleParts = parts.slice(0, -1);
      return { title: titleParts.join(' - ').trim(), artist: null, raw };
    }
    // "Title - Artist - Extra" or "Title - Artist"
    return { title: parts[0].trim(), artist: parts[1].trim(), raw };
  }

  return { title: withoutTrackNum.trim(), artist: null, raw };
}

/** Detect non-artist suffixes like toCut, SLOW, 129BPM, chords, v0.2 */
function isFileSuffix(str: string): boolean {
  const s = str.trim();
  const suffixPatterns = [
    /^to\s*cut/i,         // toCut, toCutVersion, to cut
    /^\d+\s*bpm$/i,       // 129BPM, 70BPM
    /^(slow|fast)$/i,     // SLOW, FAST
    /^chords?$/i,         // chord, chords
    /^v\d/i,              // v0.2, v1
    /^re[- ]?record/i,    // re-record, rerecord
  ];
  return suffixPatterns.some((p) => p.test(s));
}

/**
 * Score a single video file against a single song.
 * Returns 0-100 weighted score.
 */
function scoreSongMatch(parsed: ParsedFilename, song: SongRecord): number {
  const titleScore = calculateSimilarity(parsed.title, song.title);

  if (parsed.artist && song.author) {
    const artistScore = calculateSimilarity(parsed.artist, song.author);
    return Math.round(0.6 * titleScore + 0.4 * artistScore);
  }

  return titleScore;
}

/**
 * Find the best song match for a single video file.
 */
export function matchVideoToSongs(
  file: DriveFileInfo,
  songs: SongRecord[]
): VideoMatchResult {
  const parsed = parseVideoFilename(file.name);

  const scored = songs
    .map((song) => ({ song, score: scoreSongMatch(parsed, song) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0] || null;
  const second = scored[1] || null;

  let status: MatchStatus = 'unmatched';
  if (best && best.score >= MATCHED_THRESHOLD) {
    // Check if runner-up is dangerously close
    if (second && best.score - second.score < RUNNER_UP_GAP) {
      status = 'ambiguous';
    } else {
      status = 'matched';
    }
  } else if (best && best.score >= AMBIGUOUS_THRESHOLD) {
    status = 'ambiguous';
  }

  return {
    driveFile: file,
    parsed,
    bestMatch: best,
    runnerUp: second,
    status,
  };
}

/**
 * Match all video files against all songs. Returns results sorted by status.
 */
export function matchAllVideosToSongs(
  files: DriveFileInfo[],
  songs: SongRecord[]
): VideoMatchResult[] {
  const statusOrder: Record<MatchStatus, number> = {
    matched: 0,
    ambiguous: 1,
    unmatched: 2,
  };

  return files
    .map((file) => matchVideoToSongs(file, songs))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}
