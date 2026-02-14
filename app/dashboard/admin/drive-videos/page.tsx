import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DriveVideosClient } from '@/components/dashboard/admin/drive-videos';

export const metadata = {
  title: 'Drive Videos | Admin Dashboard',
  description: 'Manage synced Google Drive videos and run new scans',
};

export default async function DriveVideosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('user_overview')
    .select('is_admin, is_teacher')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    redirect('/dashboard');
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Drive Videos</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage synced Google Drive videos and scan for new files
        </p>
      </div>

      <DriveVideosClient />
    </main>
  );
}
