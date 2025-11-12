import { SongDetail } from '@/components/songs';
import SongLessons from '@/components/songs/SongLessons';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { Breadcrumbs } from '@/components/shared';
import { redirect } from 'next/navigation';

interface SongPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SongPage({ params }: SongPageProps) {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();
  if (!user) {
    redirect('/sign-in');
  }

  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Songs', href: '/dashboard/songs' },
          { label: 'Song Details' },
        ]}
      />
      
      <SongDetail songId={id} isAdmin={isAdmin} isTeacher={isTeacher} />
      
      <SongLessons songId={id} />
    </div>
  );
}
