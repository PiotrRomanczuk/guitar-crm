'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ExportButton } from '@/components/users/actions/ExportButton';

interface UserDetailProps {
  user: {
    id: string;
    full_name: string | null;
    email: string;
    is_admin: boolean;
    is_teacher: boolean;
    is_student: boolean;
    is_shadow: boolean | null;
    avatar_url: string | null;
    notes: string | null;
  };
}

export default function UserDetail({ user }: UserDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/dashboard/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const getRolesBadges = () => {
    const roles = [];
    if (user.is_admin) roles.push('Admin');
    if (user.is_teacher) roles.push('Teacher');
    if (user.is_student) roles.push('Student');
    return roles.length ? roles : ['No Role'];
  };

  const isRegistered = !user.is_shadow;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="border-b pb-4 mb-4">
        <CardTitle className="text-2xl font-bold">{user.full_name || 'N/A'}</CardTitle>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Full Name</Label>
            <p className="font-medium mt-1">{user.full_name || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground block mb-1">Status</Label>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={
                  isRegistered
                    ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800'
                    : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                }
              >
                {isRegistered ? 'Registered' : 'Shadow'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div>
          <Label className="text-muted-foreground block mb-2">Roles</Label>
          <div className="flex flex-wrap gap-2">
            {getRolesBadges().map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                data-testid={`role-badge-${role.toLowerCase()}`}
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-muted-foreground block mb-2">Notes</Label>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 min-h-[60px] border">
            {user.notes || 'No notes available.'}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 pt-4 border-t">
        <Link href={`/dashboard/users/${user.id}/edit`}>
          <Button>Edit</Button>
        </Link>

        {user.is_student && (
          <ExportButton userId={user.id} userName={user.full_name || user.email} />
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user{' '}
                <strong>{user.email}</strong> and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
