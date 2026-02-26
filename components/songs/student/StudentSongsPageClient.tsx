'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Music2, Loader2 } from 'lucide-react';
import { useStudentSongs } from './useStudentSongs';
import { StudentSongFilterControls } from './StudentSongFilterControls';
import { StudentSongCard } from './StudentSongCard';

export function StudentSongsPageClient() {
  const {
    songs,
    loading,
    updatingStatus,
    filters,
    updateFilter,
    clearFilters,
    updateSongStatus,
    filteredSongs,
    hasActiveFilters,
  } = useStudentSongs();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div
        className="mb-6 sm:mb-8 opacity-0 animate-fade-in"
        style={{ animationFillMode: 'forwards' }}
      >
        <h1 className="text-2xl sm:text-3xl font-semibold">My Songs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Songs you are currently learning or have mastered.
        </p>
      </div>

      {songs.length > 0 && (
        <StudentSongFilterControls
          searchQuery={filters.searchQuery}
          onSearchChange={(v) => updateFilter('searchQuery', v)}
          difficultyFilter={filters.difficultyFilter}
          onDifficultyChange={(v) => updateFilter('difficultyFilter', v)}
          statusFilter={filters.statusFilter}
          onStatusChange={(v) => updateFilter('statusFilter', v)}
          sortBy={filters.sortBy}
          onSortChange={(v) => updateFilter('sortBy', v as 'name' | 'author' | 'difficulty' | 'status')}
          filteredCount={filteredSongs.length}
          totalCount={songs.length}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {songs.length === 0 ? (
        <StudentSongsEmptyState />
      ) : filteredSongs.length === 0 ? (
        <StudentSongsNoResults onClearFilters={clearFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSongs.map((song) => (
            <StudentSongCard
              key={song.id}
              song={song}
              onStatusChange={updateSongStatus}
              isUpdating={updatingStatus === song.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentSongsEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="relative w-64 h-48 mx-auto mb-6">
        <Image
          src="/illustrations/no-upcoming-lessons--future-focused---a-forward-lo.png"
          alt="No songs assigned"
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-lg font-medium mb-2">No songs assigned yet</h3>
      <p className="text-muted-foreground mb-4">
        You haven&apos;t been assigned any songs yet. Your teacher will add songs as you
        progress through your lessons.
      </p>
      <p className="text-sm text-muted-foreground">
        Have questions? Contact your teacher for guidance on what to practice next.
      </p>
    </div>
  );
}

function StudentSongsNoResults({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="relative w-64 h-48 mx-auto mb-6">
        <Music2 className="w-24 h-24 text-muted-foreground/30 mx-auto" />
      </div>
      <h3 className="text-lg font-medium mb-2">No songs match your filters</h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your search or filter criteria to see more songs.
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
