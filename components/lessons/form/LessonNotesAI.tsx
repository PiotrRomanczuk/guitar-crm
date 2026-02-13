'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback } from 'react';
import { generateLessonNotesStream } from '@/app/actions/ai';
import { useAIStream } from '@/hooks/useAIStream';
import { AIAssistButton } from '@/components/lessons/shared/AIAssistButton';
import { AIStreamingStatus } from '@/components/ai';

interface Props {
  studentName: string;
  studentId?: string;
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
  studentId,
  songsCovered,
  lessonTopic,
  duration,
  teacherNotes,
  previousNotes,
  onNotesGenerated,
  disabled = false,
}: Props) {
  // Streaming action wrapper
  const streamAction = useCallback(
    async function* (params: any, signal?: AbortSignal) {
      yield* generateLessonNotesStream(params);
    },
    []
  );

  // AI streaming hook
  const aiStream = useAIStream(streamAction, {
    onChunk: (content) => {
      onNotesGenerated(content);
    },
    onError: (error) => {
      console.error('[LessonNotesAI] Streaming error:', error);
      onNotesGenerated('Error generating notes. Please try again.');
    },
  });

  const handleGenerate = async () => {
    if (!studentName || aiStream.isStreaming) return;

    onNotesGenerated(''); // Clear previous notes

    await aiStream.start({
      studentName,
      studentId,
      songTitle: songsCovered.join(', '),
      lessonFocus: lessonTopic,
      skillsWorked: teacherNotes,
      nextSteps: '',
    });
  };

  const canGenerate = studentName && songsCovered.length > 0 && lessonTopic && !disabled;

  return (
    <div className="space-y-3">
      <AIAssistButton
        onClick={handleGenerate}
        disabled={!canGenerate}
        label="Generate Lesson Notes"
        status={aiStream.status}
        tokenCount={aiStream.tokenCount}
        onCancel={aiStream.cancel}
        className="mt-2"
      />

      {/* Streaming Status */}
      {(aiStream.isStreaming || aiStream.isError) && (
        <AIStreamingStatus
          status={aiStream.status}
          tokenCount={aiStream.tokenCount}
          reasoning={aiStream.reasoning}
          error={aiStream.error}
          onCancel={aiStream.cancel}
          onRetry={() => {
            aiStream.reset();
            handleGenerate();
          }}
        />
      )}
    </div>
  );
}
