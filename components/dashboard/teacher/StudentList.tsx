'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cardEntrance } from '@/lib/animations';
import { Search } from 'lucide-react';
import type { StudentListProps } from './studentList.types';
import { ITEMS_PER_PAGE } from './studentList.types';
import { StudentListSkeleton } from './StudentList.Skeleton';
import { StudentListError, StudentListEmpty, StudentListNoResults } from './StudentList.States';
import { StudentListMobile, StudentListDesktop, StudentListPagination } from './StudentList.Rows';

export function StudentList({ students, isLoading, error, onRetry }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lessons'>('name');
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) return <StudentListSkeleton />;
  if (error) return <StudentListError onRetry={onRetry} />;

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.lessonsCompleted - a.lessonsCompleted;
    });

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  return (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div className="p-4 sm:p-6 border-b border-border space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Students Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your active students {filteredStudents.length > 0 && `(${filteredStudents.length})`}
          </p>
        </div>

        {students.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                aria-label="Search students"
                value={searchTerm}
                onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                className="pl-9 h-11 sm:h-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={levelFilter}
                onValueChange={(v) => handleFilterChange(() => setLevelFilter(v))}
              >
                <SelectTrigger
                  className="flex-1 sm:w-[140px] h-11 sm:h-10"
                  aria-label="Filter by level"
                >
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(v) => handleFilterChange(() => setSortBy(v as 'name' | 'lessons'))}
              >
                <SelectTrigger
                  className="flex-1 sm:w-[130px] h-11 sm:h-10"
                  aria-label="Sort students by"
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="lessons">Lessons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <StudentListEmpty />
      ) : filteredStudents.length === 0 ? (
        <StudentListNoResults />
      ) : (
        <>
          <StudentListMobile students={paginatedStudents} />
          <StudentListDesktop students={paginatedStudents} />
          {totalPages > 1 && (
            <StudentListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </motion.div>
  );
}
