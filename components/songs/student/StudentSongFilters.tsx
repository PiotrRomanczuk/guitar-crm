'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, TrendingUp, SortAsc } from 'lucide-react';

interface StudentSongFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export function StudentSongFilters({
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
  onClearFilters,
}: StudentSongFiltersProps) {
  const hasActiveFilters = searchQuery || difficultyFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search songs or artists..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={difficultyFilter} onValueChange={onDifficultyChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-1">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="to_learn">📝 To Learn</SelectItem>
              <SelectItem value="learning">🎵 Learning</SelectItem>
              <SelectItem value="practicing">🎸 Practicing</SelectItem>
              <SelectItem value="improving">📈 Improving</SelectItem>
              <SelectItem value="mastered">🏆 Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2 flex-1">
          <SortAsc className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Song Name</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="status">Learning Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalCount} songs
          </span>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
