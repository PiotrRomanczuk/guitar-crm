'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterChips } from '@/components/ui/filter-chips';
import { Search } from 'lucide-react';

interface Student {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  full_name: string | null;
}

interface FiltersProps {
  search: string;
  status: string;
  studentId: string;
  showStudentFilter?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStudentChange: (value: string) => void;
  onReset: () => void;
}

const statusChips = [
  { id: '', label: 'All' },
  { id: 'not_started', label: 'Not Started' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
];

export function Filters({
  search,
  status,
  studentId,
  showStudentFilter = false,
  onSearchChange,
  onStatusChange,
  onStudentChange,
}: FiltersProps) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!showStudentFilter) return;

    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/users?role=student&limit=100');
        if (response.ok) {
          const result = await response.json();
          setStudents(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch students', error);
      }
    };
    fetchStudents();
  }, [showStudentFilter]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          placeholder="Search by student or title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Filter Chips */}
      <FilterChips
        chips={statusChips}
        selected={status || ''}
        onChange={onStatusChange}
      />

      {/* Student Filter (dropdown for teachers) */}
      {showStudentFilter && students.length > 0 && (
        <div className="pt-2">
          <Select
            value={studentId || 'all'}
            onValueChange={(val) => onStudentChange(val === 'all' ? '' : val)}
          >
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
              <SelectValue placeholder="All Students" />
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
    </div>
  );
}
