import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getSongDatabaseStatistics } from '@/lib/services/song-analytics';
import { SongStatsTable } from '@/components/dashboard/admin/SongStatsTable';
import { SendAdminReportButton } from '@/components/dashboard/admin/SendAdminReportButton';
import { redirect } from 'next/navigation';
import { Shield, Music } from 'lucide-react';

export const metadata = {
  title: 'Song Database Health | Guitar CRM',
  description: 'Analytics and health report for the song database',
};

export default async function SongHealthPage() {
  const { isAdmin, isTeacher } = await getUserWithRolesSSR();

  // Only allow admins (and teachers for now as per rules)
  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  const stats = await getSongDatabaseStatistics();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Music className="h-8 w-8 text-primary" />
              Song Database Health
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and improve the quality of your song library metadata.
            </p>
          </div>
          <SendAdminReportButton />
        </div>
      </div>

      <SongStatsTable stats={stats} />
    </div>
  );
}
