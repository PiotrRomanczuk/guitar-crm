'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateAssignmentStream } from '@/app/actions/ai';

interface Props {
  studentName: string;
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  recentSongs: string[];
  focusArea: string;
  duration: string;
  lessonTopic?: string;
  onAssignmentGenerated: (assignment: string) => void;
  disabled?: boolean;
}

export function AssignmentAI({
  studentName,
  studentLevel,
  recentSongs,
  focusArea,
  duration,
  lessonTopic,
  onAssignmentGenerated,
  disabled = false,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!studentName || loading) return;

    setLoading(true);
    onAssignmentGenerated(''); // Clear previous assignment

    try {
      const streamGenerator = generateAssignmentStream({
        studentName,
        skillLevel: studentLevel,
        focusArea,
        timeAvailable: duration,
        additionalNotes: `Recent songs: ${recentSongs.join(', ')}. Lesson topic: ${lessonTopic}`,
      });

      let currentAssignment = '';
      for await (const chunk of streamGenerator) {
        currentAssignment = String(chunk);
        onAssignmentGenerated(currentAssignment);
      }
    } catch (error) {
      console.error('Error generating assignment:', error);
      onAssignmentGenerated('Error generating assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = studentName && focusArea && duration && !disabled;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading || !canGenerate}
      className="mt-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}
      AI Generate Assignment
    </Button>
  );
}
