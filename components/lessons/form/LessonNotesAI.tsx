'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateLessonNotes } from '@/app/actions/ai';

interface Props {
  studentName: string;
  songsCovered: string[];
  lessonTopic: string;
  duration?: number;
  teacherNotes?: string;
  previousNotes?: string;
  onNotesGenerated: (notes: string) => void;
  disabled?: boolean;
}

export function LessonNotesAI({
  studentName,
  songsCovered,
  lessonTopic,
  duration,
  teacherNotes,
  previousNotes,
  onNotesGenerated,
  disabled = false,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!studentName || loading) return;

    setLoading(true);
    try {
      const result = await generateLessonNotes({
        studentName,
        songsCovered,
        lessonTopic,
        duration,
        teacherNotes,
        previousNotes,
      });

      if (result.success && result.notes) {
        onNotesGenerated(String(result.notes)); // Ensure it's a string
      } else {
        console.error('Failed to generate lesson notes:', result.error);
      }
    } catch (error) {
      console.error('Error generating lesson notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = studentName && songsCovered.length > 0 && lessonTopic && !disabled;

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
      AI Suggest Notes
    </Button>
  );
}
