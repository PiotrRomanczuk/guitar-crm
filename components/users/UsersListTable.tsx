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
import { Trash2, Eye, Pencil } from 'lucide-react';

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
  return (
    <div className="rounded-md border">
      <Table data-testid="users-table">
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
            <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
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
                  <Badge
                    variant={user.isActive ? 'default' : 'destructive'}
                    className={
                      user.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 w-fit'
                        : 'w-fit'
                    }
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      user.isRegistered
                        ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800 w-fit'
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 w-fit'
                    }
                  >
                    {user.isRegistered ? 'Registered' : 'Shadow'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <Link href={`/dashboard/users/${user.id}`} data-testid={`view-user-${user.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
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
  );
}
