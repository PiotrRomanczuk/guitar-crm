'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Clock, Music2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, listItem, cardEntrance } from '@/lib/animations';

interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  studentsLearning: number;
}

interface SongLibraryProps {
  songs: Song[];
}

const difficultyColors = {
  Easy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0',
  Medium: 'bg-primary/10 text-primary border-0',
  Hard: 'bg-destructive/10 text-destructive border-0',
};

export function SongLibrary({ songs }: SongLibraryProps) {
  return (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="font-semibold text-base sm:text-lg">Song Library</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Popular songs being taught</p>
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
          <h3 className="text-lg font-semibold mb-2">No Songs Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Songs assigned to you will appear here.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-border"
        >
          <AnimatePresence mode="popLayout">
            {songs.map((song, index) => (
              <motion.div
                key={`${song.id}-${index}`}
                variants={listItem}
                layout
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                whileTap={{ scale: 0.98 }}
                className="p-4 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{song.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{song.artist}</p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] sm:text-xs', difficultyColors[song.difficulty])}
                      >
                        {song.difficulty}
                      </Badge>
                      <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {song.duration}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {song.studentsLearning} students
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
