/**
 * Parse raw chord strings into structured representations.
 */

export interface ParsedChord {
  raw: string;
  root: string;
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'suspended' | 'power';
  extension: string;
  bass: string | null;
}

const ROOT_PATTERN = /^([A-G][#b]?)/;

const QUALITY_MAP: Array<[RegExp, ParsedChord['quality']]> = [
  [/^(dim|°|o)/, 'diminished'],
  [/^(aug|\+)/, 'augmented'],
  [/^(sus)/, 'suspended'],
  [/^5$/, 'power'],
  [/^(m|min|-)(?!aj)/, 'minor'],
];

/**
 * Parse a single chord token like "Em7" or "F#m7b5/C#".
 */
export function parseChord(raw: string): ParsedChord | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 50) return null;

  const rootMatch = trimmed.match(ROOT_PATTERN);
  if (!rootMatch) return null;

  const root = rootMatch[1];
  let remainder = trimmed.slice(root.length);

  // Handle slash bass note
  let bass: string | null = null;
  const slashIdx = remainder.indexOf('/');
  if (slashIdx !== -1) {
    const bassCandidate = remainder.slice(slashIdx + 1);
    if (ROOT_PATTERN.test(bassCandidate)) {
      bass = bassCandidate.match(ROOT_PATTERN)![1];
      remainder = remainder.slice(0, slashIdx);
    }
  }

  // Determine quality
  let quality: ParsedChord['quality'] = 'major';
  let extension = remainder;

  for (const [pattern, q] of QUALITY_MAP) {
    if (pattern.test(remainder)) {
      quality = q;
      extension = remainder.replace(pattern, '');
      break;
    }
  }

  // "maj" without preceding "m" is still major
  if (remainder.startsWith('maj') || remainder.startsWith('Maj')) {
    quality = 'major';
    extension = remainder.replace(/^[Mm]aj/, '');
  }

  return { raw: trimmed, root, quality, extension, bass };
}

/**
 * Parse the `chords` column from the DB.
 * Handles CSV ("Em, G, D"), Postgres arrays ("{Em,G,D}"), and plain strings.
 */
export function parseChordsColumn(chords: unknown): ParsedChord[] {
  if (!chords || typeof chords !== 'string') return [];

  let tokens: string[];
  const str = chords.trim();

  if (str.startsWith('{') && str.endsWith('}')) {
    // Postgres array literal
    tokens = str.slice(1, -1).split(',');
  } else {
    tokens = str.split(/[,\s]+/);
  }

  return tokens
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter((t) => t.length > 0 && t.length <= 50 && /^[A-G]/.test(t))
    .map(parseChord)
    .filter((p): p is ParsedChord => p !== null);
}
