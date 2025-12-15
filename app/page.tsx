import { NewLandingPage } from '@/components/home/NewLandingPage';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { DatabaseStatus } from '@/components/debug/DatabaseStatus';

export default async function Home() {
  const { user } = await getUserWithRolesSSR();

  // console.log(user, isAdmin, isTeacher, isStudent);

  // If not authenticated, show the marketing/landing page
  if (!user) {
    return (
      <>
        <NewLandingPage />
        <DatabaseStatus />
      </>
    );
  }

  // If authenticated, redirect to dashboard
  redirect('/dashboard');
}
