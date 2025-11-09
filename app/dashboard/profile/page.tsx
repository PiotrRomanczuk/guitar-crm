import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import ProfilePageClient from './profile.client';

export default async function ProfilePage() {
  const { user } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');
  return <ProfilePageClient userId={user.id} />;
}
