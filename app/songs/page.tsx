import { SongList } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

export default async function SongsPage() {
	const { user } = await getUserWithRolesSSR();
	if (!user) {
		redirect('/sign-in');
	}
	return (
		<div className='container mx-auto px-4 py-8'>
			<SongList />
		</div>
	);
}
