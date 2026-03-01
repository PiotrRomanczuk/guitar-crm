/**
 * Detect common chord progression archetypes from Roman numeral sequences.
 */

export interface ProgressionArchetype {
  name: string;
  pattern: string[];
  description: string;
}

export const ARCHETYPES: ProgressionArchetype[] = [
  { name: 'Pop', pattern: ['I', 'V', 'vi', 'IV'], description: 'The most common pop progression' },
  { name: 'Axis', pattern: ['vi', 'IV', 'I', 'V'], description: 'Rotation of the pop progression' },
  { name: '50s', pattern: ['I', 'vi', 'IV', 'V'], description: 'Classic doo-wop progression' },
  { name: 'Blues', pattern: ['I', 'IV', 'V'], description: '12-bar blues foundation' },
  { name: 'Andalusian', pattern: ['iv', 'III', 'II', 'I'], description: 'Flamenco/Spanish cadence' },
  { name: 'Jazz ii-V-I', pattern: ['ii', 'V', 'I'], description: 'Jazz standard resolution' },
  { name: 'Canon', pattern: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], description: 'Pachelbel\'s Canon' },
];

/**
 * Strip extensions from a Roman numeral for matching (e.g., "I7" -> "I").
 */
function stripExtensions(numeral: string): string {
  return numeral.replace(/[0-9#b°+]|sus|add|maj|dim|aug/g, '').trim() || numeral;
}

/**
 * Check if a pattern appears as a contiguous subsequence (including rotations).
 */
function containsPattern(numerals: string[], pattern: string[]): boolean {
  if (numerals.length < pattern.length) return false;

  const stripped = numerals.map(stripExtensions);

  // Check direct subsequence
  for (let i = 0; i <= stripped.length - pattern.length; i++) {
    if (pattern.every((p, j) => stripped[i + j] === p)) return true;
  }

  // Check rotation: wrap around the sequence
  if (stripped.length >= pattern.length) {
    const doubled = [...stripped, ...stripped];
    for (let i = 0; i < stripped.length; i++) {
      if (pattern.every((p, j) => doubled[i + j] === p)) return true;
    }
  }

  return false;
}

/**
 * Detect which archetypes are present in a Roman numeral sequence.
 */
export function detectArchetypes(numerals: string[]): ProgressionArchetype[] {
  return ARCHETYPES.filter((a) => containsPattern(numerals, a.pattern));
}
