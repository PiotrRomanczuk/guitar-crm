import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SongFilters } from '../types';

interface Props {
  filters: SongFilters;
  onChange: (filters: SongFilters) => void;
}

export default function SongListFilter({ filters, onChange }: Props) {
  const handleLevelChange = (level: string) => {
    onChange({
      ...filters,
      level: level === 'all' ? null : (level as SongFilters['level']),
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleReset = () => {
    onChange({
      level: null,
      search: '',
    });
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search Filter */}
        <div className="space-y-2">
          <Label htmlFor="search-filter">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-filter"
              placeholder="Search by title or artist..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>

        {/* Level Filter */}
        <div className="space-y-2">
          <Label htmlFor="level-filter">Filter by level</Label>
          <Select value={filters.level || 'all'} onValueChange={handleLevelChange}>
            <SelectTrigger id="level-filter">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
            disabled={!filters.level && !filters.search}
          >
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
