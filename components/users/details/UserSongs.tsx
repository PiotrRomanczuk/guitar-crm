'use client';

import Link from 'next/link';

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
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Recent Songs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {songs?.length || 0} song{songs?.length !== 1 ? 's' : ''} in the library
          </p>
        </div>
      </div>

      {/* Songs Grid */}
      {songs && songs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/dashboard/songs/${song.id}`}
              className="group p-4 border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all duration-200 bg-card"
            >
              <div className="flex flex-col gap-3">
                {/* Song Title */}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {song.title}
                  </p>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      song.level === 'beginner'
                        ? 'bg-success/10 text-success'
                        : song.level === 'intermediate'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {song.level || 'unknown'}
                  </span>
                </div>

                {/* Song Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-base">🎤</span>
                    <span className="truncate">{song.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-base">🎹</span>
                    <span className="font-mono font-semibold">{song.key || 'Unknown key'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No songs found</p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Songs will appear here once added to the library
          </p>
        </div>
      )}
    </div>
  );
}
