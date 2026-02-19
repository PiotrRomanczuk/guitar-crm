import { type NoteName } from '@/lib/music-theory';

export type CAGEDShape = 'C' | 'A' | 'G' | 'E' | 'D';

export interface CAGEDPattern {
    name: CAGEDShape;
    offsets: { stringIndex: number; fretOffset: number }[];
    rootStringIndex: number;
}

export const CAGED_PATTERNS: CAGEDPattern[] = [
    {
        name: 'C',
        rootStringIndex: 1, // S5
        offsets: [
            { stringIndex: 1, fretOffset: 0 },
            { stringIndex: 2, fretOffset: -1 },
            { stringIndex: 3, fretOffset: -3 },
            { stringIndex: 4, fretOffset: -2 },
            { stringIndex: 5, fretOffset: -3 },
        ],
    },
    {
        name: 'A',
        rootStringIndex: 1, // S5
        offsets: [
            { stringIndex: 1, fretOffset: 0 },
            { stringIndex: 2, fretOffset: 2 },
            { stringIndex: 3, fretOffset: 2 },
            { stringIndex: 4, fretOffset: 2 },
            { stringIndex: 5, fretOffset: 0 },
        ],
    },
    {
        name: 'G',
        rootStringIndex: 0, // S6
        offsets: [
            { stringIndex: 0, fretOffset: 0 },
            { stringIndex: 1, fretOffset: -1 },
            { stringIndex: 2, fretOffset: -3 },
            { stringIndex: 3, fretOffset: -3 },
            { stringIndex: 4, fretOffset: -3 },
            { stringIndex: 5, fretOffset: 0 },
        ],
    },
    {
        name: 'E',
        rootStringIndex: 0, // S6
        offsets: [
            { stringIndex: 0, fretOffset: 0 },
            { stringIndex: 1, fretOffset: 2 },
            { stringIndex: 2, fretOffset: 2 },
            { stringIndex: 3, fretOffset: 1 },
            { stringIndex: 4, fretOffset: 0 },
            { stringIndex: 5, fretOffset: 0 },
        ],
    },
    {
        name: 'D',
        rootStringIndex: 2, // S4
        offsets: [
            { stringIndex: 2, fretOffset: 0 },
            { stringIndex: 3, fretOffset: 2 },
            { stringIndex: 4, fretOffset: 3 },
            { stringIndex: 5, fretOffset: 2 },
        ],
    },
];

export interface CAGEDActiveShape {
    name: CAGEDShape;
    rootFret: number;
    rootStringIndex: number;
    cells: { stringIndex: number; fret: number }[];
}

export function getActiveCAGEDShapes(
    rootNote: NoteName,
    fretboard: NoteName[][],
): CAGEDActiveShape[] {
    const activeShapes: CAGEDActiveShape[] = [];

    // Iterate over patterns
    CAGED_PATTERNS.forEach((pattern) => {
        const s = pattern.rootStringIndex;
        // Find all occurrences of rootNote on this string
        for (let f = 0; f <= 15; f++) {
            if (fretboard[s][f] === rootNote) {
                // Candidate root found. Check if the shape fits on the fretboard
                const cells: { stringIndex: number; fret: number }[] = [];
                let fits = true;

                for (const offset of pattern.offsets) {
                    const targetFret = f + offset.fretOffset;
                    if (targetFret < 0 || targetFret > 15) {
                        fits = false;
                        break;
                    }
                    cells.push({ stringIndex: offset.stringIndex, fret: targetFret });
                }

                if (fits) {
                    activeShapes.push({
                        name: pattern.name,
                        rootFret: f,
                        rootStringIndex: s,
                        cells,
                    });
                }
            }
        }
    });

    return activeShapes;
}
