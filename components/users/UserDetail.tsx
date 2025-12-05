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

interface UserDetailProps {
  user: {
    id: string | number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    username: string | null;
    isAdmin: boolean;
    isTeacher: boolean | null;
    isStudent: boolean | null;
    isActive: boolean;
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
    if (user.isAdmin) roles.push('Admin');
    if (user.isTeacher) roles.push('Teacher');
    if (user.isStudent) roles.push('Student');
    return roles.length ? roles : ['No Role'];
  };

  const fullName =
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'N/A';

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="border-b pb-4 mb-4">
        <CardTitle className="text-2xl font-bold">{fullName}</CardTitle>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">First Name</Label>
            <p className="font-medium mt-1">{user.firstName || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Last Name</Label>
            <p className="font-medium mt-1">{user.lastName || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Username</Label>
            <p className="font-medium mt-1">{user.username || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground block mb-1">Status</Label>
            <Badge
              variant={user.isActive ? 'default' : 'destructive'}
              className={
                user.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                  : ''
              }
              data-testid="status-badge"
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
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
      </CardContent>

      <CardFooter className="flex gap-3 pt-4 border-t">
                <Link href={`/dashboard/users/${user.id}/edit`}>
          <Button>
            Edit
          </Button>
        </Link>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user <strong>{user.email}</strong> and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Link href="/dashboard/users">
          <Button variant="outline">
            Back
          </Button>
        </Link>

      </CardFooter>
    </Card>
  );
}
