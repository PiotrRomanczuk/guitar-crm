import { Label } from '@/components/ui/label';
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

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>
    </div>
  );
}
