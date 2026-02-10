'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { GENERATION_TYPE_LABELS, type AIGenerationType } from '@/types/ai-generation';

interface FiltersProps {
  typeFilter?: AIGenerationType;
  isStarred?: boolean;
  search?: string;
  onTypeChange: (type: AIGenerationType | undefined) => void;
  onStarredChange: (starred: boolean | undefined) => void;
  onSearchChange: (search: string) => void;
}

export function AIGenerationHistoryFilters({
  typeFilter,
  isStarred,
  search,
  onTypeChange,
  onStarredChange,
  onSearchChange,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search content..."
        value={search ?? ''}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-[240px]"
      />
      <Select
        value={typeFilter ?? 'all'}
        onValueChange={(v) => onTypeChange(v === 'all' ? undefined : (v as AIGenerationType))}
      >
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {Object.entries(GENERATION_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={isStarred ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStarredChange(isStarred ? undefined : true)}
        className="gap-1.5"
      >
        <Star className={`size-4 ${isStarred ? 'fill-current' : ''}`} />
        Starred
      </Button>
    </div>
  );
}
