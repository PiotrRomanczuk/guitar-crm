import { LandingPage } from '@/components/home';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { user } = await getUserWithRolesSSR();

  // console.log(user, isAdmin, isTeacher, isStudent);

  // If not authenticated, show the marketing/landing page
  if (!user) {
    return <LandingPage />;
  }

  // If authenticated, redirect to dashboard
  redirect('/dashboard');
}
