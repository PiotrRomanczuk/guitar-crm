'use client';

import { useEffect, useState } from 'react';
import { EntityLink, StatusBadge, getStatusVariant, formatStatus } from '@/components/shared';
import Link from 'next/link';

interface SongAssignment {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  student_id: string;
  lesson_id: string | null;
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  lesson: {
    id: string;
    lesson_teacher_number: number;
  } | null;
}

interface Props {
  songId: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
}

export default function SongAssignments({ songId }: Props) {
  const [assignments, setAssignments] = useState<SongAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSongAssignments() {
      try {
        const response = await fetch(`/api/song/${songId}/assignments`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch: ${response.status}`);
        }

        setAssignments(data.assignments || []);
      } catch (err) {
        console.error('Error fetching song assignments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    }

    fetchSongAssignments();
  }, [songId]);

  if (loading) {
    return <div className="text-muted-foreground">Loading related assignments...</div>;
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          Related Assignments
        </h2>
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return null; // Don't show section if empty
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-foreground">Related Assignments</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted-foreground">
          <thead className="text-xs text-foreground uppercase bg-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Title
              </th>
              <th scope="col" className="px-4 py-3">
                Student
              </th>
              <th scope="col" className="px-4 py-3">
                Lesson
              </th>
              <th scope="col" className="px-4 py-3">
                Due Date
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr
                key={assignment.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link
                    href={`/dashboard/assignments/${assignment.id}`}
                    className="text-primary hover:underline"
                  >
                    {assignment.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {assignment.student ? (
                    <EntityLink href={`/dashboard/users/${assignment.student.id}`}>
                      {assignment.student.full_name || assignment.student.email || 'Unknown'}
                    </EntityLink>
                  ) : (
                    'Unknown'
                  )}
                </td>
                <td className="px-4 py-3">
                  {assignment.lesson ? (
                    <Link
                      href={`/dashboard/lessons/${assignment.lesson.id}`}
                      className="text-primary hover:underline"
                    >
                      Lesson #{assignment.lesson.lesson_teacher_number}
                    </Link>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-3">{formatDate(assignment.due_date)}</td>
                <td className="px-4 py-3">
                  <StatusBadge variant={getStatusVariant(assignment.status)}>
                    {formatStatus(assignment.status)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
