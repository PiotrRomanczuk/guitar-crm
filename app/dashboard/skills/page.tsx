import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { SkillsManager } from '@/components/skills/SkillsManager';
import { redirect } from 'next/navigation';

export default async function SkillsPage() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  return <SkillsManager />;
}
