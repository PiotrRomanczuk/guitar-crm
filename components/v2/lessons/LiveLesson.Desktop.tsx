'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, ArrowLeft, CircleStop, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardEntrance, staggerContainer, listItem } from '@/lib/animations/variants';
import { Button } from '@/components/ui/button';
import { LiveSongCard } from '@/components/lessons/live/LiveSongCard';
import { LiveLessonNotes } from '@/components/lessons/live/LiveLessonNotes';
import { formatLessonDate } from './lesson.helpers';
import type { LiveLessonV2Props } from './LiveLesson';

/**
 * v2 Desktop Live Lesson view.
 * Two-column layout: songs on left, notes on right.
 * Full-width top bar with student name and action button.
 */
export default function LiveLessonDesktop({ lesson }: LiveLessonV2Props) {
  const songsWithData = lesson.lessonSongs.filter((ls) => ls.song !== null);
  const isCompleted = lesson.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header
        className={cn(
          'sticky top-0 z-40 bg-background/95 backdrop-blur-sm',
          'border-b border-border'
        )}
      >
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 min-w-0">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/dashboard/lessons/${lesson.id}`}
                aria-label="Back to lesson"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">
                Live: {lesson.studentName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatLessonDate(lesson.scheduledAt)}
                {lesson.title && ` — ${lesson.title}`}
              </p>
            </div>
          </div>
          <Button variant="destructive" className="gap-2" asChild>
            <Link href={`/dashboard/lessons/${lesson.id}`}>
              <CircleStop className="h-4 w-4" />
              {isCompleted ? 'Close Review' : 'End Lesson'}
            </Link>
          </Button>
        </div>
      </header>

      {/* Two-column content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Songs column (wider) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase">
                Songs ({songsWithData.length})
              </h2>
            </div>
            {songsWithData.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {songsWithData.map((ls) => (
                  <motion.div key={ls.id} variants={listItem}>
                    <LiveSongCard lessonId={lesson.id} lessonSong={ls} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No songs assigned to this lesson.
              </div>
            )}
          </div>

          {/* Notes column */}
          <motion.div
            variants={cardEntrance}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase">
                  Lesson Notes
                </h2>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <LiveLessonNotes
                  lessonId={lesson.id}
                  initialNotes={lesson.notes ?? ''}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
