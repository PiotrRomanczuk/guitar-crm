'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, PlaySquare, Music2, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewActions } from './ReviewActions';
import {
  useSpotifySuggestion,
  useAcceptSpotifySuggestion,
  useAcceptHighScores,
} from './useDriveVideos';

export interface ReviewQueueItem {
  filename: string;
  driveFileId: string;
  parsed: { title: string; artist: string | null } | null;
  bestMatch: {
    songId: string;
    title: string;
    author: string;
    score: number;
  } | null;
  runnerUp: {
    songId: string;
    title: string;
    author: string;
    score: number;
  } | null;
}

interface ReviewQueueTableProps {
  items: ReviewQueueItem[];
  onRefresh: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 dark:text-green-400 font-bold';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreBadge(score: number) {
  if (score >= 70) {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{score}</Badge>;
  }
  if (score >= 50) {
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{score}</Badge>;
  }
  if (score >= 40) {
    return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">{score}</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{score}</Badge>;
}

// Mobile card component with Spotify query
function ReviewQueueMobileCard({
  item,
  selected,
  onToggle,
}: {
  item: ReviewQueueItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const { data: spotifySuggestion, isLoading: loadingSpotify } = useSpotifySuggestion(
    item.driveFileId,
    item.parsed
  );
  const acceptSpotify = useAcceptSpotifySuggestion();

  const handleAcceptSpotify = () => {
    if (!spotifySuggestion) return;
    acceptSpotify.mutate({
      spotifyTrackId: spotifySuggestion.id,
      driveFileId: item.driveFileId,
      filename: item.filename,
      parsed: item.parsed,
    });
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${item.filename}`}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <span className="text-xs font-mono block">{item.filename}</span>
          {item.parsed && (
            <div className="text-sm">
              <div>{item.parsed.title}</div>
              {item.parsed.artist && <div className="text-xs text-muted-foreground">{item.parsed.artist}</div>}
            </div>
          )}

          {/* Suggestions */}
          <div className="space-y-2 pt-2 border-t border-border">
            {/* Database Match */}
            {item.bestMatch && (
              <div className="flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                <Database className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Database</div>
                  <div className="text-sm font-medium">{item.bestMatch.title}</div>
                  <div className="text-xs text-muted-foreground">{item.bestMatch.author}</div>
                </div>
                {getScoreBadge(item.bestMatch.score)}
              </div>
            )}

            {/* Spotify Suggestion */}
            {loadingSpotify ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Spotify...</span>
              </div>
            ) : spotifySuggestion ? (
              <div className="p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2 mb-2">
                  <Music2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Spotify</div>
                    <div className="text-sm font-medium">{spotifySuggestion.name}</div>
                    <div className="text-xs text-muted-foreground">{spotifySuggestion.artist}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full h-8 bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptSpotify}
                  disabled={acceptSpotify.isPending}
                >
                  {acceptSpotify.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Use Spotify Match'}
                </Button>
              </div>
            ) : null}
          </div>
          <ReviewActions item={item} />
        </div>
      </div>
    </div>
  );
}

// Row component with Spotify query
function ReviewQueueRow({
  item,
  selected,
  onToggle,
}: {
  item: ReviewQueueItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const { data: spotifySuggestion, isLoading: loadingSpotify } = useSpotifySuggestion(
    item.driveFileId,
    item.parsed
  );
  const acceptSpotify = useAcceptSpotifySuggestion();

  const handleAcceptSpotify = () => {
    if (!spotifySuggestion) return;
    acceptSpotify.mutate({
      spotifyTrackId: spotifySuggestion.id,
      driveFileId: item.driveFileId,
      filename: item.filename,
      parsed: item.parsed,
    });
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${item.filename}`}
        />
      </TableCell>
      <TableCell>
        <span className="text-xs font-mono line-clamp-1">{item.filename}</span>
      </TableCell>
      <TableCell>
        {item.parsed ? (
          <div className="space-y-0.5">
            <div className="text-sm">{item.parsed.title}</div>
            {item.parsed.artist && <div className="text-xs text-muted-foreground">{item.parsed.artist}</div>}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Could not parse</span>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          {/* Database Match */}
          {item.bestMatch ? (
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.bestMatch.title}</div>
                <div className="text-xs text-muted-foreground">{item.bestMatch.author}</div>
              </div>
              <div className="flex-shrink-0">{getScoreBadge(item.bestMatch.score)}</div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="w-4 h-4" />
              <span>No database match</span>
            </div>
          )}

          {/* Spotify Suggestion */}
          {loadingSpotify ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching Spotify...</span>
            </div>
          ) : spotifySuggestion ? (
            <div className="flex items-start gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <Music2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{spotifySuggestion.name}</div>
                <div className="text-xs text-muted-foreground">{spotifySuggestion.artist}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs px-2 text-green-700 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900"
                onClick={handleAcceptSpotify}
                disabled={acceptSpotify.isPending}
              >
                Use
              </Button>
            </div>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <ReviewActions item={item} />
      </TableCell>
    </TableRow>
  );
}

export function ReviewQueueTable({ items, onRefresh }: ReviewQueueTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const acceptHighScores = useAcceptHighScores();

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.driveFileId)));
    }
  };

  const handleAcceptSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error('No videos selected');
      return;
    }

    try {
      const overrides: Record<string, string> = {};
      items
        .filter((item) => selectedIds.has(item.driveFileId) && item.bestMatch)
        .forEach((item) => {
          overrides[item.driveFileId] = item.bestMatch!.songId;
        });

      const res = await fetch('/api/admin/drive-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept-selected', overrides }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to accept videos');
      }

      const data = await res.json();
      toast.success(`Accepted ${data.inserted ?? 0} videos`);
      setSelectedIds(new Set());
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept selected videos';
      toast.error(message);
    }
  };

  const handleAcceptHighScores = () => {
    const highScores = items.filter((item) => item.bestMatch && item.bestMatch.score >= 70);
    if (highScores.length === 0) {
      toast.info('No high-score videos (70+) to accept');
      return;
    }
    acceptHighScores.mutate();
  };

  const highScoreCount = items.filter((item) => item.bestMatch && item.bestMatch.score >= 70).length;

  return (
    <div className="space-y-4">
      {/* Bulk actions toolbar */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === items.length && items.length > 0}
              onCheckedChange={toggleAll}
              aria-label="Select all videos"
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select videos'}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedIds.size > 0 && (
              <Button size="sm" onClick={handleAcceptSelected} disabled={acceptHighScores.isPending} className="min-h-[36px]">
                <CheckSquare className="w-4 h-4 mr-2" />
                Accept Selected ({selectedIds.size})
              </Button>
            )}
            {highScoreCount > 0 && (
              <Button size="sm" variant="outline" onClick={handleAcceptHighScores} disabled={acceptHighScores.isPending} className="min-h-[36px]">
                <PlaySquare className="w-4 h-4 mr-2" />
                Accept All High Scores (70+) · {highScoreCount}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.size === items.length && items.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Parsed Title</TableHead>
              <TableHead>Suggestions (DB + Spotify)</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <ReviewQueueRow
                key={item.driveFileId}
                item={item}
                selected={selectedIds.has(item.driveFileId)}
                onToggle={() => toggleSelection(item.driveFileId)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <ReviewQueueMobileCard
            key={item.driveFileId}
            item={item}
            selected={selectedIds.has(item.driveFileId)}
            onToggle={() => toggleSelection(item.driveFileId)}
          />
        ))}
      </div>
    </div>
  );
}
