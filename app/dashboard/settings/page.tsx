import SettingsPageClient from '@/components/settings/SettingsPageClient';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

// Server Component wrapper for Settings page.
// Fetches authenticated user (SSR) and redirects if unauthenticated.
// Interactive logic is delegated to a client component boundary.
export default async function SettingsPage() {
  const { user } = await getUserWithRolesSSR();
  let isGoogleConnected = false;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (user) {
    const { data } = await supabase
      .from('user_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single();

    if (data) {
      isGoogleConnected = true;
    }
  }

  return (
    <SettingsPageClient isGoogleConnected={isGoogleConnected} bearerToken={session?.access_token} />
  );
}

// TODO: When settings persistence moves to the database, hydrate initial settings here
//       by querying a `user_settings` table and pass as prop to client component.
