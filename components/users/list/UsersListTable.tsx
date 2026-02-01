'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Pencil, Users } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';

interface UserProfile {
  id: string;
  user_id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  isAdmin: boolean;
  isTeacher: boolean | null;
  isStudent: boolean | null;
  isActive: boolean;
  isRegistered: boolean;
  created_at: string | null;
}

interface UsersListTableProps {
  users: UserProfile[];
  onDelete: (userId: string, email: string) => void;
}

function getRoleDisplay(user: UserProfile): string {
  const roles = [];
  if (user.isAdmin) roles.push('Admin');
  if (user.isTeacher) roles.push('Teacher');
  if (user.isStudent) roles.push('Student');
  return roles.length > 0 ? roles.join(', ') : 'No Role';
}

function getInitials(firstName: string | null, lastName: string | null): string {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?';
}

export default function UsersListTable({ users, onDelete }: UsersListTableProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={Users}
        title="No users found"
        description="Create a user to get started"
        action={{ label: "Add User", href: "/dashboard/users/new" }}
      />
    );
  }

  return (
    <>
      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                <StatusBadge variant={user.isActive ? 'active' : 'inactive'} size="sm">
                  {user.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
                <StatusBadge variant={user.isRegistered ? 'registered' : 'shadow'} size="sm">
                  {user.isRegistered ? 'Registered' : 'Shadow'}
                </StatusBadge>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-xs">
                {getRoleDisplay(user)}
              </Badge>

              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/dashboard/users/${user.id}`} data-testid={`view-user-${user.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link
                    href={`/dashboard/users/${user.id}/edit`}
                    data-testid={`edit-user-${user.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user.id, user.email || 'User')}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  data-testid={`delete-user-${user.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <Table data-testid="users-table" className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  data-testid={`user-row-${user.id}`}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getRoleDisplay(user)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StatusBadge variant={user.isActive ? 'active' : 'inactive'} size="sm">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                      <StatusBadge variant={user.isRegistered ? 'registered' : 'shadow'} size="sm">
                        {user.isRegistered ? 'Registered' : 'Shadow'}
                      </StatusBadge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          data-testid={`view-user-${user.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/users/${user.id}/edit`}
                          data-testid={`edit-user-${user.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user.id, user.email || 'User')}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`delete-user-${user.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
