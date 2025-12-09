'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  teacher_id: string;
  student_id: string;
  lesson_id: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    full_name: string | null;
    email: string | null;
  };
}

interface FilterState {
  status: string;
}

export default function AssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    status: '',
  });
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`/api/assignments?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch assignments');

      const data = await response.json();
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading assignments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleDeleteClick = (id: string) => {
    setAssignmentToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      const response = await fetch(`/api/assignments/${assignmentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setAssignments(assignments.filter((a) => a.id !== assignmentToDelete));
      setAssignmentToDelete(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error deleting assignment');
      setAssignmentToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <AssignmentsHeader />
      <AssignmentsFilters filter={filter} onFilterChange={setFilter} />

      {error && <AssignmentsError error={error} />}

      {loading ? (
        <AssignmentsLoading />
      ) : assignments.length === 0 ? (
        <AssignmentsEmpty />
      ) : (
        <AssignmentsTable assignments={assignments} onDelete={handleDeleteClick} />
      )}

      <AlertDialog
        open={!!assignmentToDelete}
        onOpenChange={(open) => !open && setAssignmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AssignmentsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
      <Link
        href="/dashboard/assignments/new"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        data-testid="create-assignment-button"
      >
        New Assignment
      </Link>
    </div>
  );
}

interface FiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

function AssignmentsFilters({ filter, onFilterChange }: FiltersProps) {
  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filter.status || 'all'}
          onValueChange={(value) =>
            onFilterChange({ ...filter, status: value === 'all' ? '' : value })
          }
        >
          <SelectTrigger data-testid="status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AssignmentsError({ error }: { error: string }) {
  return (
    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {error}
    </div>
  );
}

function AssignmentsLoading() {
  return (
    <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading assignments...</div>
  );
}

function AssignmentsEmpty() {
  return (
    <div className="text-center py-8 text-gray-600 dark:text-gray-400">No assignments found</div>
  );
}

interface TableProps {
  assignments: Assignment[];
  onDelete: (id: string) => void;
}

function AssignmentsTable({ assignments, onDelete }: TableProps) {
  const statusColors: Record<string, string> = {
    OPEN: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
    IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    PENDING_REVIEW: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    BLOCKED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'No due date';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const isOverdue = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="rounded-md border" data-testid="assignments-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id} data-testid={`assignment-row-${assignment.id}`}>
              <TableCell>
                <Link
                  href={`/dashboard/assignments/${assignment.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {assignment.title}
                </Link>
              </TableCell>
              <TableCell>
                {assignment.student?.full_name || assignment.student?.email || 'Unknown'}
              </TableCell>
              <TableCell
                className={
                  isOverdue(assignment.due_date)
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }
              >
                {formatDate(assignment.due_date)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${statusColors[assignment.status]} border-0`}
                >
                  {assignment.status.replace(/_/g, ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    data-testid={`view-button-${assignment.id}`}
                  >
                    <Link href={`/dashboard/assignments/${assignment.id}`}>View</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(assignment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    data-testid={`delete-button-${assignment.id}`}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
