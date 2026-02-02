'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { MoreVertical, Music } from 'lucide-react';
import { DifficultyBadge, type DifficultyLevel } from './DifficultyBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  songKey?: string;
  difficulty?: DifficultyLevel;
  duration?: string;
  coverArt?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

/**
 * Song card component for the songs library list
 * Displays song info with cover art, difficulty badge, and duration
 */
function SongCard({
  id,
  title,
  artist,
  songKey,
  difficulty,
  duration,
  coverArt,
  onEdit,
  onDelete,
  className,
}: SongCardProps) {
  return (
    <Link href={`/dashboard/songs/${id}`} className="block">
      <article
        className={cn(
          'group relative flex gap-3 p-3 bg-card rounded-xl shadow-sm border',
          'active:scale-[0.99] transition-transform duration-100',
          'hover:border-primary/30 hover:shadow-md',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="shrink-0 relative">
          <div className="w-[72px] h-[72px] rounded-lg bg-muted overflow-hidden shadow-inner flex items-center justify-center">
            {coverArt ? (
              <Image
                src={coverArt}
                alt={`${title} cover art`}
                width={72}
                height={72}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-bold text-foreground truncate pr-2">
              {title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {artist}
            {songKey && ` • Key: ${songKey}`}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            {difficulty && <DifficultyBadge level={difficulty} />}
            {duration && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div
            className="shrink-0 flex flex-col items-center justify-center"
            onClick={(e) => e.preventDefault()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </article>
    </Link>
  );
}

export { SongCard, type SongCardProps };
