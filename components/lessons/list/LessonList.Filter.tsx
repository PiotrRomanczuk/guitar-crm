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
  students?: { id: string; full_name: string | null; email: string }[];
  teachers?: { id: string; full_name: string | null; email: string }[];
  showStudentFilter?: boolean;
  showTeacherFilter?: boolean;
}

export default function LessonListFilter({
  students = [],
  teachers = [],
  showStudentFilter = false,
  showTeacherFilter = false,
}: Props) {
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
    !!searchParams.get('status') ||
    !!searchParams.get('search') ||
    !!searchParams.get('studentId') ||
    !!searchParams.get('teacherId');

  return (
    <div
      data-testid="lessons-filters"
      className="bg-card rounded-xl border border-border p-4 sm:p-6 mb-6 opacity-0 animate-fade-in"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
    >
      {/* Search Filter - Full Width */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="search-filter">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="search-filter"
            placeholder="Search by title or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-status">Filter by Status</Label>
          <Select
            value={searchParams.get('status') || 'all'}
            onValueChange={(val) => handleFilterChange('status', val === 'all' ? null : val)}
          >
            <SelectTrigger id="filter-status" data-testid="filter-status-trigger">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lessons</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showStudentFilter && (
          <div className="space-y-2">
            <Label htmlFor="filter-student">Filter by Student</Label>
            <Select
              value={searchParams.get('studentId') || 'all'}
              onValueChange={(val) => handleFilterChange('studentId', val === 'all' ? null : val)}
            >
              <SelectTrigger id="filter-student" data-testid="filter-student-trigger">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name || student.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showTeacherFilter && (
          <div className="space-y-2">
            <Label htmlFor="filter-teacher">Filter by Teacher</Label>
            <Select
              value={searchParams.get('teacherId') || 'all'}
              onValueChange={(val) => handleFilterChange('teacherId', val === 'all' ? null : val)}
            >
              <SelectTrigger id="filter-teacher" data-testid="filter-teacher-trigger">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name || teacher.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasFilters && (
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button variant="outline" onClick={handleReset} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
