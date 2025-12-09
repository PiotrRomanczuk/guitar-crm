'use client';

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
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

interface Props {
  students?: { id: string; full_name: string | null }[];
}

export default function SongListFilter({ students }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Local state for search input to avoid lag
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const handleFilterChange = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace]
  );

  const handleReset = () => {
    setSearchTerm('');
    replace(pathname);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('search') || '')) {
        handleFilterChange('search', searchTerm || null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, handleFilterChange, searchParams]);

  const hasFilters =
    !!searchParams.get('level') || !!searchParams.get('search') || !!searchParams.get('studentId');

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Level Filter */}
        <div className="space-y-2">
          <Label htmlFor="level-filter">Filter by level</Label>
          <Select
            value={searchParams.get('level') || 'all'}
            onValueChange={(val) => handleFilterChange('level', val === 'all' ? null : val)}
          >
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

        {/* Student Filter */}
        {students && students.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="student-filter">Filter by Student</Label>
            <Select
              value={searchParams.get('studentId') || 'all'}
              onValueChange={(val) => handleFilterChange('studentId', val === 'all' ? null : val)}
            >
              <SelectTrigger id="student-filter">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name || 'Unknown Student'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reset Button */}
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
