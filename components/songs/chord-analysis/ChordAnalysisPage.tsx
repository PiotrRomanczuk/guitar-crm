'use client';

import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChordAnalysis } from '../hooks/useChordAnalysis';
import { ChordAnalysisKPIs } from './ChordAnalysisKPIs';
import { ProgressionBarChart } from './ProgressionBarChart';
import { ArchetypeCards } from './ArchetypeCards';
import { ChordFrequencyChart } from './ChordFrequencyChart';
import { TransitionHeatmap } from './TransitionHeatmap';
import { ProgressionLengthChart } from './ProgressionLengthChart';
import { TheoryTable } from './TheoryTable';

export function ChordAnalysisPage() {
  const { data, isLoading, error } = useChordAnalysis();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        Failed to load chord analysis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChordAnalysisKPIs data={data} />

      <Tabs defaultValue="progressions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progressions">Progressions</TabsTrigger>
          <TabsTrigger value="theory">Theory</TabsTrigger>
          <TabsTrigger value="chords">Chords</TabsTrigger>
        </TabsList>

        <TabsContent value="progressions" className="space-y-6">
          <ProgressionBarChart data={data.progressionFrequencies} />
          <ArchetypeCards songAnalyses={data.songAnalyses} />
          <ProgressionLengthChart data={data.progressionLengths} />
        </TabsContent>

        <TabsContent value="theory" className="space-y-6">
          <TheoryTable songAnalyses={data.songAnalyses} />
        </TabsContent>

        <TabsContent value="chords" className="space-y-6">
          <ChordFrequencyChart data={data.chordFrequencies} />
          <TransitionHeatmap transitions={data.transitions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
