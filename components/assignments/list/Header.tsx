import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

interface HeaderProps {
  canCreate: boolean;
}

/**
 * Assignment list header with title and create button
 */
export function Header({ canCreate }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">Manage student assignments and tasks</p>
      </div>
      {canCreate && (
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/assignments/templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/assignments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Assignment
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
