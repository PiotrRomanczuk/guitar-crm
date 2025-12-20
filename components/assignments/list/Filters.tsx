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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

export function Filters({
  search,
  status,
  studentId,
  showStudentFilter = false,
  onSearchChange,
  onStatusChange,
  onStudentChange,
  onReset,
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
    <div className="bg-card rounded-xl border shadow-sm p-4 space-y-4 animate-fade-in mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {showStudentFilter && (
          <div className="space-y-2">
            <Label>Student</Label>
            <Select
              value={studentId || 'all'}
              onValueChange={(val) => onStudentChange(val === 'all' ? '' : val)}
            >
              <SelectTrigger>
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

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status || 'all'}
            onValueChange={(val) => onStatusChange(val === 'all' ? '' : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={onReset} className="w-full">
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
