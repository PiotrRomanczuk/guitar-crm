import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { staggerContainer, listItem } from '@/lib/animations';
import { ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import type { Student } from './studentList.types';
import { levelColors } from './studentList.types';

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

export function StudentListMobile({ students }: { students: Student[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="md:hidden p-4 space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {students.map((student) => (
          <motion.div key={student.id} variants={listItem} layout whileTap={{ scale: 0.98 }}>
            <Link
              href={`/dashboard/users/${student.id}`}
              className="block bg-background rounded-lg border border-border p-4 active:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px]"
              aria-label={`${student.name}, ${student.level} level, ${student.lessonsCompleted} lessons completed`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 border border-border flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(student.name)}
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
                    <p className="text-sm text-muted-foreground">Next: {student.nextLesson}</p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export function StudentListDesktop({ students }: { students: Student[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="hidden md:block divide-y divide-border"
    >
      <AnimatePresence mode="popLayout">
        {students.map((student) => (
          <motion.div
            key={student.id}
            variants={listItem}
            layout
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            className="transition-colors"
          >
            <Link
              href={`/dashboard/users/${student.id}`}
              className="p-4 flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px]"
              aria-label={`${student.name}, ${student.level} level, ${student.lessonsCompleted} lessons completed`}
            >
              <Avatar className="w-10 h-10 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {getInitials(student.name)}
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
  );
}

export function StudentListPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center justify-between md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="min-h-[44px] min-w-[44px]"
        >
          Next
        </Button>
      </div>

      <Pagination className="hidden md:flex">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink onClick={() => onPageChange(page)} isActive={currentPage === page}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
