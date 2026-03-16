import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { ChordAnalysisPage } from '@/components/songs/chord-analysis';
import { Breadcrumbs } from '@/components/shared';

export default async function ChordAnalysisRoute() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Songs', href: '/dashboard/songs' },
          { label: 'Chord Analysis' },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Chord Progression Analysis</h1>
        <p className="text-muted-foreground">
          Music theory analysis, progression patterns, and archetype detection across the song
          library.
        </p>
      </div>
      <ChordAnalysisPage />
    </div>
  );
}
