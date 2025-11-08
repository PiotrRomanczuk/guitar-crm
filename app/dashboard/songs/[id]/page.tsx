import { SongDetail } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

interface SongPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SongPage({ params }: SongPageProps) {
  const { user } = await getUserWithRolesSSR();
  if (!user) {
    redirect('/sign-in');
  }

  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <SongDetail songId={id} />
    </div>
  );
}
