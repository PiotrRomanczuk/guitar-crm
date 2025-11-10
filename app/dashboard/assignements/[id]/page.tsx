import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { DeleteAssignmentButton } from './DeleteAssignmentButton';

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

async function getAssignment(id: string): Promise<Assignment | null> {
  const supabase = await createClient();
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user) redirect('/auth/login');

  let query = supabase.from('assignments').select('*').eq('id', id);

  if (!isAdmin) {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query.single();

  if (error || !data) return null;
  return data as Assignment;
}

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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await getAssignment(id);

  if (!assignment) {
    return <AssignmentNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/dashboard/assignements"
        className="text-blue-600 hover:underline mb-6 inline-block"
        data-testid="back-button"
      >
        ← Back to assignments
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <AssignmentHeader assignment={assignment} />
        <AssignmentMetrics assignment={assignment} />

        {assignment.description && <AssignmentDescription description={assignment.description} />}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <DeleteAssignmentButton assignmentId={assignment.id} />
        </div>
      </div>
    </div>
  );
}

function AssignmentNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Assignment not found
        </h1>
        <Link href="/dashboard/assignements" className="text-blue-600 hover:underline">
          Back to assignments
        </Link>
      </div>
    </div>
  );
}

function AssignmentHeader({ assignment }: { assignment: Assignment }) {
  const createdDate = new Date(assignment.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            data-testid="assignment-title"
          >
            {assignment.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Created {createdDate}</p>
        </div>

        <Link
          href={`/dashboard/assignements/${assignment.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          data-testid="edit-button"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

function AssignmentMetrics({ assignment }: { assignment: Assignment }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
          Priority
        </p>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            priorityColors[assignment.priority]
          }`}
          data-testid="assignment-priority"
        >
          {assignment.priority}
        </span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
          Status
        </p>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[assignment.status]
          }`}
          data-testid="assignment-status"
        >
          {assignment.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
          Due Date
        </p>
        <p className="text-sm text-gray-900 dark:text-white" data-testid="assignment-due-date">
          {formatDate(assignment.due_date)}
        </p>
      </div>
    </div>
  );
}

function AssignmentDescription({ description }: { description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
      <p
        className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
        data-testid="assignment-description"
      >
        {description}
      </p>
    </div>
  );
}
