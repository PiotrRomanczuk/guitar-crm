'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface FilterState {
  status: string;
  priority: string;
}

export default function AssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    status: '',
    priority: '',
  });

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting assignment');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AssignmentsHeader />
      <AssignmentsFilters filter={filter} onFilterChange={setFilter} />

      {error && <AssignmentsError error={error} />}

      {loading ? (
        <AssignmentsLoading />
      ) : assignments.length === 0 ? (
        <AssignmentsEmpty />
      ) : (
        <AssignmentsTable assignments={assignments} onDelete={handleDelete} />
      )}
    </div>
  );
}

function AssignmentsHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        <Link
          href="/dashboard/assignements/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          data-testid="create-assignment-button"
        >
          New Assignment
        </Link>
      </div>
    </div>
  );
}

interface FiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

function AssignmentsFilters({ filter, onFilterChange }: FiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <select
        value={filter.status}
        onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
        className="px-4 py-2 border border-gray-300 bg-white rounded-lg dark:bg-gray-800 dark:border-gray-600"
        data-testid="status-filter"
      >
        <option value="">All Status</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="PENDING_REVIEW">Pending Review</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="BLOCKED">Blocked</option>
      </select>

      <select
        value={filter.priority}
        onChange={(e) => onFilterChange({ ...filter, priority: e.target.value })}
        className="px-4 py-2 border border-gray-300 bg-white rounded-lg dark:bg-gray-800 dark:border-gray-600"
        data-testid="priority-filter"
      >
        <option value="">All Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
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
  onDelete: (id: string) => Promise<void>;
}

function AssignmentsTable({ assignments, onDelete }: TableProps) {
  const priorityColors: Record<string, string> = {
    LOW: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

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
    <div
      className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
      data-testid="assignments-table"
    >
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Title
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {assignments.map((assignment) => (
            <tr
              key={assignment.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
              data-testid={`assignment-row-${assignment.id}`}
            >
              <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                <Link
                  href={`/dashboard/assignements/${assignment.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {assignment.title}
                </Link>
              </td>
              <td
                className={`px-6 py-3 text-sm ${
                  isOverdue(assignment.due_date)
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {formatDate(assignment.due_date)}
              </td>
              <td className="px-6 py-3 text-sm">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    priorityColors[assignment.priority]
                  }`}
                >
                  {assignment.priority}
                </span>
              </td>
              <td className="px-6 py-3 text-sm">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[assignment.status]
                  }`}
                >
                  {assignment.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-3 text-sm">
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/assignements/${assignment.id}`}
                    className="text-blue-600 hover:underline"
                    data-testid={`view-button-${assignment.id}`}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => onDelete(assignment.id)}
                    className="text-red-600 hover:underline"
                    data-testid={`delete-button-${assignment.id}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
