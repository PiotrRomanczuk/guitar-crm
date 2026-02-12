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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Eye, Pencil, Users } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

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
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/users/${user.id}`} data-testid={`view-user-${user.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/users/${user.id}/edit`}
                      data-testid={`edit-user-${user.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(user.id, user.email || 'User')}
                    className="text-destructive focus:text-destructive"
                    data-testid={`delete-user-${user.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getRoleDisplay(user)}
              </Badge>
              <div className="flex items-center gap-1.5 ml-auto">
                <span
                  className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-muted-foreground/40'}`}
                />
                <span className="text-xs text-muted-foreground">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                {!user.isRegistered && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                    Shadow
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <Table data-testid="users-table">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
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
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getRoleDisplay(user)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${user.isActive ? 'bg-success' : 'bg-muted-foreground/40'}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {!user.isRegistered && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                          Shadow
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            data-testid={`view-user-${user.id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/users/${user.id}/edit`}
                            data-testid={`edit-user-${user.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(user.id, user.email || 'User')}
                          className="text-destructive focus:text-destructive"
                          data-testid={`delete-user-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
