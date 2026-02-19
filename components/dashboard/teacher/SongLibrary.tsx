'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Music2, Plus, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { staggerContainer, cardEntrance } from '@/lib/animations';
import type { Song } from './SongLibrary.Card';
import { SongCard } from './SongLibrary.Card';

interface SongLibraryProps {
  songs: Song[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const DISPLAY_LIMIT = 5;

function SongLibrarySkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-44 mt-2" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-start gap-3 sm:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SongLibraryError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-card rounded-xl border border-destructive/50 overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-destructive">Error loading songs</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Failed to fetch song library. Please try again.
        </p>
      </div>
      <div className="p-6 text-center">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="min-h-[44px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export function SongLibrary({ songs, isLoading, error, onRetry }: SongLibraryProps) {
  const [showAll] = useState(false);

  if (isLoading) return <SongLibrarySkeleton />;
  if (error) return <SongLibraryError onRetry={onRetry} />;

  const displayedSongs = showAll ? songs : songs.slice(0, DISPLAY_LIMIT);
  const hasMore = songs.length > DISPLAY_LIMIT;

  return (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="font-semibold text-base sm:text-lg">Song Library</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Popular songs being taught
          {songs.length > 0 && ` (${songs.length})`}
        </p>
      </div>

      {songs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Music2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">No Songs in Library</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Add songs to your library to assign them to students and track their learning progress.
          </p>
          <Link href="/dashboard/songs">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="min-h-[44px]">
                <Plus className="w-4 h-4 mr-2" />
                Add Song
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border"
          >
            <AnimatePresence mode="popLayout">
              {displayedSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </AnimatePresence>
          </motion.div>

          {hasMore && (
            <div className="p-4 border-t border-border">
              <Link href="/dashboard/songs">
                <Button variant="outline" className="w-full min-h-[44px]" size="sm">
                  View All {songs.length} Songs
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
