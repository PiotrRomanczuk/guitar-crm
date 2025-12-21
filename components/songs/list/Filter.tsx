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
import { MUSIC_KEY_OPTIONS } from '../form/options';

interface Props {
  students?: { id: string; full_name: string | null }[];
  categories?: string[];
  authors?: string[];
}

export default function SongListFilter({ students, categories, authors }: Props) {
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
    !!searchParams.get('level') ||
    !!searchParams.get('search') ||
    !!searchParams.get('studentId') ||
    !!searchParams.get('key') ||
    !!searchParams.get('category') ||
    !!searchParams.get('author');

  return (
    <div
      className="bg-card rounded-xl border border-border p-6 space-y-6 opacity-0 animate-fade-in"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
    >
      {/* Search Filter - Full Width */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

        {/* Key Filter */}
        <div className="space-y-2">
          <Label htmlFor="key-filter">Filter by Key</Label>
          <Select
            value={searchParams.get('key') || 'all'}
            onValueChange={(val) => handleFilterChange('key', val === 'all' ? null : val)}
          >
            <SelectTrigger id="key-filter">
              <SelectValue placeholder="Select key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Keys</SelectItem>
              {MUSIC_KEY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="category-filter">Filter by Category</Label>
            <Select
              value={searchParams.get('category') || 'all'}
              onValueChange={(val) => handleFilterChange('category', val === 'all' ? null : val)}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Author Filter */}
        {authors && authors.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="author-filter">Filter by Author</Label>
            <Select
              value={searchParams.get('author') || 'all'}
              onValueChange={(val) => handleFilterChange('author', val === 'all' ? null : val)}
            >
              <SelectTrigger id="author-filter">
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
