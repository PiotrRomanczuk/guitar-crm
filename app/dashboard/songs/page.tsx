import { SongList } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SongsPage(props: Props) {
  const searchParams = await props.searchParams;
  const { user } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');

  return (
    <div className="container mx-auto px-4 py-8">
      <SongList searchParams={searchParams} />
    </div>
  );
}
