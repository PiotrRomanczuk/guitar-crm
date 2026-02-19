'use client';

import Link from 'next/link';
import { Music, Mic, Keyboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Song {
  id: string;
  title: string;
  author: string;
  key: string | null;
  level: string | null;
}

interface UserSongsProps {
  songs: Song[] | null;
}

export default function UserSongs({ songs }: UserSongsProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Songs List */}
      {songs && songs.length > 0 ? (
        <div className="divide-y divide-border">
          {songs.map((song) => {
            const isUnknownAuthor = !song.author || song.author.toLowerCase() === 'unknown';
            const isUnknownKey = !song.key || song.key.toLowerCase().includes('unknown');

            return (
              <Link
                key={song.id}
                href={`/dashboard/songs/${song.id}`}
                className="block p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                      <Music className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {song.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`
                            shrink-0 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 h-5
                            ${song.level === 'beginner'
                              ? 'bg-green-100/50 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : song.level === 'intermediate'
                                ? 'bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                                : 'bg-red-100/50 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }
                          `}
                        >
                          {song.level || 'N/A'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {!isUnknownAuthor ? (
                          <span className="flex items-center gap-1 truncate">
                            <Mic className="h-3 w-3" />
                            {song.author}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 italic">Unknown Artist</span>
                        )}

                        {!isUnknownKey && (
                          <span className="flex items-center gap-1 font-mono bg-muted/50 px-1.5 rounded">
                            <Keyboard className="h-3 w-3" />
                            {song.key}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow or Action (Optional, for now just implicit click) */}
                  <div className="text-muted-foreground/30 group-hover:text-foreground/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Music className="h-6 w-6 text-purple-500/50" />
          </div>
          <p className="text-foreground font-medium">No songs in repertoire</p>
          <p className="text-muted-foreground text-sm mt-1">
            Added songs will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
