'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SpotifyTrack } from '@/types/spotify';
import Image from 'next/image';

interface Props {
  onSelect: (track: SpotifyTrack) => void;
}

export default function SpotifySearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.tracks) {
        setResults(data.tracks);
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 mb-6 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Spotify for a song..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} variant="secondary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {searched && results.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground text-center py-2">No results found.</p>
      )}

      {results.length > 0 && (
        <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
          {results.map((track) => (
            <Card
              key={track.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelect(track)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                {track.image ? (
                  <div className="relative w-10 h-10 rounded overflow-hidden">
                    <Image
                      src={track.image}
                      alt={track.album}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <Music className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{track.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
