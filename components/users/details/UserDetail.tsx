'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ExportButton } from '@/components/users/actions/ExportButton';
import { CsvSongImportButton } from '@/components/users/import';
import { MoreVertical, Edit, Trash2, User, FileText, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';

interface RelatedProfile {
  id: string;
  full_name: string | null;
  email: string;
}

interface UserDetailProps {
  user: {
    id: string;
    full_name: string | null;
    email: string;
    is_admin: boolean;
    is_teacher: boolean;
    is_student: boolean;
    is_shadow: boolean | null;
    is_parent: boolean;
    avatar_url: string | null;
    notes: string | null;
  };
  parentProfile?: RelatedProfile | null;
  linkedStudents?: RelatedProfile[];
}

export default function UserDetail({ user, parentProfile, linkedStudents = [] }: UserDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/dashboard/users');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deleting user');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const getRolesBadges = () => {
    const roles = [];
    if (user.is_admin) roles.push('Admin');
    if (user.is_teacher) roles.push('Teacher');
    if (user.is_student) roles.push('Student');
    if (user.is_parent) roles.push('Parent');
    return roles.length ? roles : ['No Role'];
  };

  const isRegistered = !user.is_shadow;
  const initials = user.full_name
    ? user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <Card className="max-w-4xl mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg shrink-0">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {user.full_name || 'User Profile'}
              </h1>
              <p className="text-muted-foreground font-medium">{user.email}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
              <Badge
                variant={isRegistered ? "default" : "secondary"}
                className={
                  isRegistered
                    ? 'bg-success/10 text-success hover:bg-success/20 border-success/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              >
                {isRegistered ? 'Registered' : 'Unregistered'}
              </Badge>
              {getRolesBadges().map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.is_student && (
              <div className="hidden sm:flex items-center gap-2">
                <CsvSongImportButton studentId={user.id} />
                <ExportButton userId={user.id} userName={user.full_name || user.email} />
              </div>
            )}

            <Link href="/dashboard/ai">
              <Button variant="ghost" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Suggestions</span>
              </Button>
            </Link>

            <Link href={`/dashboard/users/${user.id}/edit`}>
              <Button className="gap-2 shadow-sm">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-8">
        {/* About & Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Contact</Label>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <div className="p-2 bg-muted rounded-full">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
            </div>

            {/* Mobile only actions */}
            {user.is_student && (
              <div className="sm:hidden space-y-3 pt-4 border-t">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Quick Actions</Label>
                <div className="flex flex-col gap-2">
                  <div className="w-full">
                    <CsvSongImportButton studentId={user.id} />
                  </div>
                  <div className="w-full">
                    <ExportButton userId={user.id} userName={user.full_name || user.email} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Notes */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Teacher Notes</Label>
              <Link href={`/dashboard/users/${user.id}/edit`} className="text-xs text-primary hover:text-primary/80 font-medium">
                Edit Notes
              </Link>
            </div>

            <Link href={`/dashboard/users/${user.id}/edit`}>
              <div className={`
                relative group cursor-pointer
                rounded-xl border-2 border-dashed
                p-6 min-h-[120px]
                transition-all duration-200
                ${user.notes
                  ? 'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5'
                  : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center text-center'
                }
              `}>
                {user.notes ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {user.notes}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-primary">No notes yet</p>
                    <p className="text-xs text-muted-foreground/70">Click to add private notes about this student</p>
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Parent / Guardian section (shown for students with a linked parent) */}
        {parentProfile && (
          <div className="pt-4 border-t">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Parent / Guardian</Label>
            <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <div className="p-2 bg-muted rounded-full">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{parentProfile.full_name || parentProfile.email}</p>
                <p className="text-xs text-muted-foreground truncate">{parentProfile.email}</p>
              </div>
              <Link href={`/dashboard/users/${parentProfile.id}`}>
                <Button variant="ghost" size="sm" className="text-xs shrink-0">View</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Linked students section (shown for parent profiles) */}
        {user.is_parent && linkedStudents.length > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              Students
            </Label>
            <div className="mt-2 space-y-2">
              {linkedStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="p-2 bg-muted rounded-full">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.full_name || student.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  </div>
                  <Link href={`/dashboard/users/${student.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs shrink-0">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{user.full_name || user.email}</strong>?
              <br /><br />
              This action ensures all data (lessons, songs, assignments) is permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
