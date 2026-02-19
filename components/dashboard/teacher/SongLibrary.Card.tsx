import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Clock, Music2, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { listItem } from '@/lib/animations';

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  studentsLearning: number;
}

export const difficultyColors = {
  Easy: 'bg-success/10 text-success border-0',
  Medium: 'bg-primary/10 text-primary border-0',
  Hard: 'bg-destructive/10 text-destructive border-0',
};

export function SongCard({ song }: { song: Song }) {
  return (
    <motion.div key={song.id} variants={listItem} layout>
      <Link
        href={`/dashboard/songs/${song.id}`}
        className="block p-4 transition-colors hover:bg-muted/50 dark:hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px]"
        aria-label={`${song.title} by ${song.artist}, ${song.difficulty} difficulty`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{song.title}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{song.artist}</p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
              <Badge
                variant="outline"
                className={cn('text-[10px] sm:text-xs', difficultyColors[song.difficulty])}
              >
                {song.difficulty}
              </Badge>
              {song.duration && (
                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {song.duration}
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3" />
                {song.studentsLearning} students
              </span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}
