'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ARCHETYPES } from '@/lib/music-theory/progression-archetypes';
import type { SongRomanAnalysis } from '@/types/ChordAnalysis';

interface ArchetypeCardsProps {
  songAnalyses: SongRomanAnalysis[];
}

export function ArchetypeCards({ songAnalyses }: ArchetypeCardsProps) {
  const archetypeMap = new Map<string, string[]>();

  for (const song of songAnalyses) {
    for (const archetype of song.archetypes) {
      if (!archetypeMap.has(archetype)) archetypeMap.set(archetype, []);
      archetypeMap.get(archetype)!.push(song.title);
    }
  }

  const matched = ARCHETYPES.filter((a) => archetypeMap.has(a.name));
  if (matched.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detected Archetypes</CardTitle>
        <CardDescription>
          Common progression patterns found in the song library
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matched.map((archetype) => {
            const songs = archetypeMap.get(archetype.name) ?? [];
            return (
              <Card key={archetype.name} className="border-dashed">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{archetype.name}</h4>
                    <Badge variant="secondary">{songs.length} songs</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{archetype.description}</p>
                  <p className="text-xs font-mono">{archetype.pattern.join(' - ')}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {songs.slice(0, 3).join(', ')}
                    {songs.length > 3 ? ` +${songs.length - 3} more` : ''}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
