'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { ChordTransition } from '@/types/ChordAnalysis';

interface TransitionHeatmapProps {
  transitions: ChordTransition[];
}

function getTopChords(transitions: ChordTransition[], limit: number): string[] {
  const counts: Record<string, number> = {};
  for (const t of transitions) {
    counts[t.from] = (counts[t.from] ?? 0) + t.count;
    counts[t.to] = (counts[t.to] ?? 0) + t.count;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([chord]) => chord);
}

function buildMatrix(
  chords: string[],
  transitions: ChordTransition[]
): number[][] {
  const idx = new Map(chords.map((c, i) => [c, i]));
  const matrix = chords.map(() => chords.map(() => 0));

  for (const t of transitions) {
    const fromIdx = idx.get(t.from);
    const toIdx = idx.get(t.to);
    if (fromIdx !== undefined && toIdx !== undefined) {
      matrix[fromIdx][toIdx] = t.count;
    }
  }
  return matrix;
}

function cellColor(value: number, max: number): string {
  if (value === 0 || max === 0) return 'transparent';
  const intensity = Math.min(value / max, 1);
  const alpha = 0.15 + intensity * 0.7;
  return `hsla(var(--chart-3) / ${alpha})`;
}

export function TransitionHeatmap({ transitions }: TransitionHeatmapProps) {
  const chords = getTopChords(transitions, 12);
  const matrix = buildMatrix(chords, transitions);
  const maxVal = Math.max(...matrix.flat(), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chord Transitions</CardTitle>
        <CardDescription>
          How often one chord follows another (top 12 chords)
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left font-medium text-muted-foreground">From \ To</th>
              {chords.map((c) => (
                <th key={c} className="p-2 text-center font-medium text-muted-foreground">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chords.map((from, rowIdx) => (
              <tr key={from}>
                <td className="p-2 font-medium text-muted-foreground">{from}</td>
                {chords.map((to, colIdx) => {
                  const val = matrix[rowIdx][colIdx];
                  return (
                    <td
                      key={to}
                      className="p-2 text-center border border-border/30 min-w-[40px]"
                      style={{ backgroundColor: cellColor(val, maxVal) }}
                      title={`${from} → ${to}: ${val}`}
                    >
                      {val > 0 ? val : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
