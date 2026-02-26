'use client';

import { Music } from 'lucide-react';
import { LiveLessonTopBar } from './LiveLessonTopBar';
import { LiveSongCard } from './LiveSongCard';
import { LiveLessonNotes } from './LiveLessonNotes';
import { LiveLessonData } from './live-lesson.types';

interface LiveLessonViewProps {
  lesson: LiveLessonData;
}

function EmptySongsState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Music className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">No songs assigned</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Add songs to this lesson from the lesson detail page to track progress during the session.
      </p>
    </div>
  );
}

export function LiveLessonView({ lesson }: LiveLessonViewProps) {
  const songsWithData = lesson.lessonSongs.filter((ls) => ls.song !== null);
  const isCompleted = lesson.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-background">
      <LiveLessonTopBar
        lessonId={lesson.id}
        studentName={lesson.studentName}
        lessonDate={lesson.scheduledAt}
        isCompleted={isCompleted}
      />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {songsWithData.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Songs ({songsWithData.length})
            </h2>
            {songsWithData.map((lessonSong) => (
              <LiveSongCard
                key={lessonSong.id}
                lessonId={lesson.id}
                lessonSong={lessonSong}
              />
            ))}
          </div>
        ) : (
          <EmptySongsState />
        )}

        <div className="pt-4 border-t">
          <LiveLessonNotes
            lessonId={lesson.id}
            initialNotes={lesson.notes ?? ''}
          />
        </div>
      </main>
    </div>
  );
}
