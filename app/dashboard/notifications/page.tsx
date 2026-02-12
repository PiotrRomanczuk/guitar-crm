/**
 * Notifications Center Page
 *
 * Full-page view of all notifications with:
 * - Filter by read/unread status
 * - Pagination
 * - Mark all as read
 * - Real-time updates
 */

import { Metadata } from 'next';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { getUser } from '@/lib/supabase/server-utils';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Notifications | Guitar CRM',
  description: 'View all your notifications',
};

export default async function NotificationsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Stay up to date with your lessons, assignments, and achievements
        </p>
      </div>

      <NotificationCenter userId={user.id} />
    </div>
  );
}
