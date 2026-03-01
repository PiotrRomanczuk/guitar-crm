'use client';

import { Music, Hash, Layers, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ChordAnalysisData } from '@/types/ChordAnalysis';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}

function KPICard({ icon, label, value, subtitle }: KPICardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChordAnalysisKPIsProps {
  data: ChordAnalysisData;
}

export function ChordAnalysisKPIs({ data }: ChordAnalysisKPIsProps) {
  const topChord = data.chordFrequencies[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard
        icon={<Music className="h-5 w-5 text-blue-500" />}
        label="Songs Analyzed"
        value={data.songsAnalyzed}
        subtitle={`with valid chord + key data`}
      />
      <KPICard
        icon={<Hash className="h-5 w-5 text-purple-500" />}
        label="Unique Progressions"
        value={data.uniqueProgressions}
      />
      <KPICard
        icon={<Layers className="h-5 w-5 text-green-500" />}
        label="Most Common Chord"
        value={topChord ? topChord.chord : 'N/A'}
        subtitle={topChord ? `${topChord.count} occurrences (${topChord.percentage}%)` : undefined}
      />
      <KPICard
        icon={<Sparkles className="h-5 w-5 text-amber-500" />}
        label="Archetypes Found"
        value={data.archetypeMatches}
        subtitle="pattern matches across songs"
      />
    </div>
  );
}
