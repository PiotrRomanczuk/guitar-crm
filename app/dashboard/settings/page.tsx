import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import SettingsPageClient from '@/components/settings/SettingsPageClient';

// Server Component wrapper for Settings page.
// Fetches authenticated user (SSR) and redirects if unauthenticated.
// Interactive logic is delegated to a client component boundary.
export default async function SettingsPage() {
  const { user } = await getUserWithRolesSSR();
  if (!user) {
    redirect('/sign-in');
  }

  return <SettingsPageClient />;
}

// TODO: When settings persistence moves to the database, hydrate initial settings here
//       by querying a `user_settings` table and pass as prop to client component.
