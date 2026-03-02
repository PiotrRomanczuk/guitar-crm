'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MUSIC_KEY_OPTIONS } from '../form/options';
import { FilterSelect } from './FilterSelect';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  students?: { id: string; full_name: string | null; student_status: string | null }[];
  categories?: string[];
  authors?: string[];
}

export default function SongListFilter({ students, categories, authors }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const handleFilterChange = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace]
  );

  const handleReset = () => {
    setSearchTerm('');
    replace(pathname);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('search') || '')) {
        handleFilterChange('search', searchTerm || null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, handleFilterChange, searchParams]);

  const activeFilterCount = [
    searchParams.get('level'),
    searchParams.get('key'),
    searchParams.get('category'),
    searchParams.get('author'),
    searchParams.get('studentId'),
    searchParams.get('showDrafts') === 'true' ? 'true' : null,
  ].filter(Boolean).length;

  const hasFilters = activeFilterCount > 0 || !!searchParams.get('search');

  return (
    <div
      className="bg-card rounded-xl border border-border p-6 space-y-4 opacity-0 animate-fade-in"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
    >
      {/* Search - always visible */}
      <div className="space-y-2">
        <Label htmlFor="search-filter">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="search-filter"
            placeholder="Search by title or artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 text-lg"
          />
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        onClick={() => setFiltersExpanded(!filtersExpanded)}
        className="md:hidden w-full"
        aria-expanded={filtersExpanded}
        aria-controls="song-filter-grid"
      >
        <SlidersHorizontal className="w-4 h-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter grid - collapsed on mobile, always visible on md+ */}
      <div
        id="song-filter-grid"
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4',
          filtersExpanded ? 'grid' : 'hidden md:grid'
        )}
      >
        <FilterSelect
          id="level-filter"
          label="Filter by level"
          value={searchParams.get('level') || 'all'}
          onChange={(val) => handleFilterChange('level', val === 'all' ? null : val)}
          options={[
            { value: 'all', label: 'All Levels' },
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ]}
        />

        <FilterSelect
          id="key-filter"
          label="Filter by Key"
          value={searchParams.get('key') || 'all'}
          onChange={(val) => handleFilterChange('key', val === 'all' ? null : val)}
          options={[{ value: 'all', label: 'All Keys' }, ...MUSIC_KEY_OPTIONS]}
        />

        {categories && categories.length > 0 && (
          <FilterSelect
            id="category-filter"
            label="Filter by Category"
            value={searchParams.get('category') || 'all'}
            onChange={(val) => handleFilterChange('category', val === 'all' ? null : val)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />
        )}

        {authors && authors.length > 0 && (
          <FilterSelect
            id="author-filter"
            label="Filter by Author"
            value={searchParams.get('author') || 'all'}
            onChange={(val) => handleFilterChange('author', val === 'all' ? null : val)}
            options={[
              { value: 'all', label: 'All Authors' },
              ...authors.map((a) => ({ value: a, label: a })),
            ]}
          />
        )}

        {students && students.length > 0 && (() => {
          const activeStudents = students.filter((s) => s.student_status === 'active');
          const otherStudents = students.filter((s) => s.student_status !== 'active');

          return (
            <div className="space-y-2">
              <Label htmlFor="student-filter">Filter by Student</Label>
              <Select
                value={searchParams.get('studentId') || 'all'}
                onValueChange={(val) => handleFilterChange('studentId', val === 'all' ? null : val)}
              >
                <SelectTrigger id="student-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {activeStudents.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Active Students</SelectLabel>
                      {activeStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name || 'Unknown Student'}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {otherStudents.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Other Students</SelectLabel>
                      {otherStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name || 'Unknown Student'}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
          );
        })()}

        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-drafts"
              checked={searchParams.get('showDrafts') === 'true'}
              onCheckedChange={(checked) =>
                handleFilterChange('showDrafts', checked ? 'true' : null)
              }
            />
            <Label
              htmlFor="show-drafts"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Show Drafts
            </Label>
          </div>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={handleReset} className="w-full" disabled={!hasFilters}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
