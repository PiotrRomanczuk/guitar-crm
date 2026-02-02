'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateLessonNotesStream } from '@/app/actions/ai';
import { cn } from '@/lib/utils';

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
    onNotesGenerated(''); // Clear previous notes

    try {
      const streamGenerator = generateLessonNotesStream({
        studentName,
        songTitle: songsCovered.join(', '),
        lessonFocus: lessonTopic,
        skillsWorked: teacherNotes,
        nextSteps: '',
      });

      let currentNotes = '';
      for await (const chunk of streamGenerator) {
        currentNotes = String(chunk);
        onNotesGenerated(currentNotes);
      }
    } catch (error) {
      console.error('Error generating lesson notes:', error);
      onNotesGenerated('Error generating notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = studentName && songsCovered.length > 0 && lessonTopic && !disabled;

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading || !canGenerate}
      className={cn(
        'relative group flex items-center gap-2 px-4 py-2 rounded-full mt-2',
        'bg-gradient-to-r from-primary/10 to-warning/10',
        'hover:from-primary/20 hover:to-warning/20',
        'transition-all duration-300',
        'border border-primary/20',
        'shadow-[0_0_15px_hsl(var(--primary)/0.15)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'overflow-hidden'
      )}
    >
      {/* Icon */}
      <Sparkles
        className={cn(
          'h-4 w-4 text-primary',
          'group-hover:scale-110 transition-transform duration-300',
          loading && 'animate-spin'
        )}
      />

      {/* Label */}
      <span className="text-xs font-bold text-primary uppercase tracking-wide">
        {loading ? 'Generating...' : 'AI Assist'}
      </span>

      {/* Shimmer effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-r from-transparent via-white/20 to-transparent',
          'translate-x-[-100%] group-hover:translate-x-[100%]',
          'transition-transform duration-700',
          'pointer-events-none'
        )}
        aria-hidden="true"
      />
    </button>
  );
}
