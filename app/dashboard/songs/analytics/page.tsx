import { SongStatsPage as SongStatsCharts } from '@/components/songs/stats';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { getSongDatabaseStatistics, getChordCoverageStats } from '@/lib/services/song-analytics';
import { SongStatsTable } from '@/components/dashboard/admin/SongStatsTable';
import { ChordCoverageTab } from '@/components/songs/stats/ChordCoverageTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/shared';

export default async function SongAnalyticsPage() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  const [healthStats, chordCoverageStats] = await Promise.all([
    getSongDatabaseStatistics(),
    getChordCoverageStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Songs', href: '/dashboard/songs' },
          { label: 'Analytics' },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Song Analytics</h1>
        <p className="text-muted-foreground">
          Detailed analytics about the song library, usage, and metadata health.
        </p>
      </div>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Analytics Charts</TabsTrigger>
          <TabsTrigger value="health">Database Health</TabsTrigger>
          <TabsTrigger value="chord-coverage">Chord Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <SongStatsCharts />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Metadata Health</h2>
              <p className="text-sm text-muted-foreground">
                Monitor and improve the quality of your song library metadata.
              </p>
            </div>
            <SongStatsTable stats={healthStats} />
          </div>
        </TabsContent>

        <TabsContent value="chord-coverage" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Chord Coverage</h2>
              <p className="text-sm text-muted-foreground">
                Understand why songs are included or excluded from chord analysis.
              </p>
            </div>
            <ChordCoverageTab stats={chordCoverageStats} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
