'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fadeIn } from '@/lib/animations/variants';
import { MobilePageShell } from '@/components/v2/primitives/MobilePageShell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HeaderActions, DeleteDialog } from './UserDetail.Actions';
import { UserDetailTabBar } from './UserDetail.TabBar';
import { UserDetailTabContent } from './UserDetail.TabContent';
import type { TabValue } from './UserDetail.TabBar';
import type { UserDetailV2Props } from './UserDetail';

export function UserDetailMobile({
  user,
  tabsData,
  parentProfile,
}: UserDetailV2Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/dashboard/users');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deleting user');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [user.id, router]);

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  const roles = [
    user.is_admin && 'Admin',
    user.is_teacher && 'Teacher',
    user.is_student && 'Student',
    user.is_parent && 'Parent',
  ].filter(Boolean);

  return (
    <MobilePageShell
      title={user.full_name || 'User Profile'}
      headerActions={
        <HeaderActions userId={user.id} onDelete={() => setShowDeleteDialog(true)} />
      }
    >
      {/* Profile card */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-card rounded-xl border border-border p-4"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold truncate">
              {user.full_name || user.email}
            </h2>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map((role) => (
                <Badge
                  key={String(role)}
                  variant="outline"
                  className="text-[11px] bg-primary/5 text-primary border-primary/20"
                >
                  {String(role)}
                </Badge>
              ))}
              <Badge
                variant="outline"
                className={cn(
                  'text-[11px]',
                  !user.is_shadow
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                    : 'bg-muted text-muted-foreground border-border'
                )}
              >
                {!user.is_shadow ? 'Registered' : 'Unregistered'}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <UserDetailTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <UserDetailTabContent
            activeTab={activeTab}
            tabsData={tabsData}
            parentProfile={parentProfile}
          />
        </motion.div>
      </AnimatePresence>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        userName={user.full_name || user.email}
        deleting={deleting}
        onDelete={handleDelete}
      />
    </MobilePageShell>
  );
}
