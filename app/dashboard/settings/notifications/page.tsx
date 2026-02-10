import { Metadata } from 'next';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';

export const metadata: Metadata = {
  title: 'Notification Settings | Strummy',
  description: 'Manage your email notification preferences',
};

/**
 * Notification settings page
 * Allows users to manage their email notification preferences
 */
export default function NotificationsSettingsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground dark:text-muted-foreground-dark mt-2">
          Control which email notifications you receive from Strummy.
        </p>
      </div>

      <NotificationPreferences />
    </div>
  );
}
