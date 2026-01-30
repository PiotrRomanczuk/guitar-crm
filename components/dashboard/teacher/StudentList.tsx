'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { staggerContainer, listItem, cardEntrance } from '@/lib/animations';
import { UserPlus, Users, Search, ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonsCompleted: number;
  nextLesson: string;
  avatar?: string;
}

interface StudentListProps {
  students: Student[];
}

const levelColors = {
  Beginner: 'bg-blue-500/10 text-blue-500 border-0',
  Intermediate: 'bg-primary/10 text-primary border-0',
  Advanced: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0',
};

const ITEMS_PER_PAGE = 5;

export function StudentList({ students }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lessons'>('name');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort students
  const filteredStudents = students
    .filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.lessonsCompleted - a.lessonsCompleted;
    });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
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
      {/* Header */}
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
                <SelectTrigger className="flex-1 sm:w-[140px] h-11 sm:h-10">
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
                <SelectTrigger className="flex-1 sm:w-[130px] h-11 sm:h-10">
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

      {/* Empty States */}
      {students.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Get started by adding your first student to begin tracking their progress.
          </p>
          <Link href="/dashboard/users">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="min-h-[44px]">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      ) : filteredStudents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 sm:p-12 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Mobile Card View */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="md:hidden p-4 space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {paginatedStudents.map((student) => (
                <motion.div
                  key={student.id}
                  variants={listItem}
                  layout
                  whileTap={{ scale: 0.98 }}
                  className="bg-background rounded-lg border border-border p-4 active:bg-muted/50 transition-colors"
                >
                  <Link href={`/dashboard/users/${student.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 border border-border flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium truncate">{student.name}</p>
                          <Badge
                            variant="outline"
                            className={cn('font-medium flex-shrink-0', levelColors[student.level])}
                          >
                            {student.level}
                          </Badge>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {student.lessonsCompleted} lessons
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Next: {student.nextLesson}
                          </p>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Desktop List View */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="hidden md:block divide-y divide-border"
          >
            <AnimatePresence mode="popLayout">
              {paginatedStudents.map((student) => (
                <motion.div
                  key={student.id}
                  variants={listItem}
                  layout
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className="transition-colors"
                >
                  <Link
                    href={`/dashboard/users/${student.id}`}
                    className="p-4 flex items-center gap-4 cursor-pointer"
                  >
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Next: {student.nextLesson}</p>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <Badge
                          variant="outline"
                          className={cn('font-medium', levelColors[student.level])}
                        >
                          {student.level}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {student.lessonsCompleted} lessons
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              {/* Mobile Pagination */}
              <div className="flex items-center justify-between md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-h-[44px] min-w-[44px]"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="min-h-[44px] min-w-[44px]"
                >
                  Next
                </Button>
              </div>

              {/* Desktop Pagination */}
              <Pagination className="hidden md:flex">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
