'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { updateLessonNotes } from './actions';

interface LiveLessonNotesProps {
  lessonId: string;
  initialNotes: string;
}

export function LiveLessonNotes({ lessonId, initialNotes }: LiveLessonNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaved, setIsSaved] = useState(true);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveNotes = useCallback(
    (value: string) => {
      startTransition(async () => {
        try {
          await updateLessonNotes(lessonId, value);
          setIsSaved(true);
          toast.success('Notes saved');
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to save notes';
          toast.error(message);
        }
      });
    },
    [lessonId]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNotes(value);
      setIsSaved(false);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveNotes(value), 2000);
    },
    [saveNotes]
  );

  const handleManualSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    saveNotes(notes);
  }, [notes, saveNotes]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="lesson-notes" className="text-sm font-medium text-foreground">
          Lesson Notes
        </label>
        <div className="flex items-center gap-2">
          {!isSaved && (
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={isPending || isSaved}
            className="gap-1.5"
          >
            <Save className="size-3.5" />
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <Textarea
        id="lesson-notes"
        value={notes}
        onChange={handleChange}
        placeholder="Quick notes about this lesson..."
        className="min-h-[100px] resize-y"
      />
    </div>
  );
}
