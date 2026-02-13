'use client';

import { useCallback } from 'react';
import { generateAssignmentStream } from '@/app/actions/ai';
import { useAIStream } from '@/hooks/useAIStream';
import { AIAssistButton } from '@/components/lessons/shared/AIAssistButton';
import { AIStreamingStatus } from '@/components/ai';

interface Props {
  studentName: string;
  studentId?: string;
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
  studentId,
  studentLevel,
  recentSongs,
  focusArea,
  duration,
  lessonTopic,
  onAssignmentGenerated,
  disabled = false,
}: Props) {
  // Streaming action wrapper
  const streamAction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function* (params: any, signal?: AbortSignal) {
      yield* generateAssignmentStream(params);
    },
    []
  );

  // AI streaming hook
  const aiStream = useAIStream(streamAction, {
    onChunk: (content) => {
      onAssignmentGenerated(content);
    },
    onError: (error) => {
      console.error('[AssignmentAI] Streaming error:', error);
      onAssignmentGenerated('Error generating assignment. Please try again.');
    },
  });

  const handleGenerate = async () => {
    if (!studentName || aiStream.isStreaming) return;

    onAssignmentGenerated(''); // Clear previous assignment

    await aiStream.start({
      studentName,
      studentId,
      skillLevel: studentLevel,
      focusArea,
      timeAvailable: duration,
      additionalNotes: `Recent songs: ${recentSongs.join(', ')}. Lesson topic: ${lessonTopic}`,
    });
  };

  const canGenerate = studentName && focusArea && duration && !disabled;

  return (
    <div className="space-y-3">
      <AIAssistButton
        onClick={handleGenerate}
        disabled={!canGenerate}
        label="Generate Assignment"
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
