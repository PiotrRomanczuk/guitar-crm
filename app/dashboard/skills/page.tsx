import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { SkillsManager } from '@/components/skills/SkillsManager';
import { getUIVersion } from '@/lib/ui-version.server';
import { SkillBrowserClient } from '@/components/v2/skills';
import { redirect } from 'next/navigation';

export default async function SkillsPage() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  const uiVersion = await getUIVersion();

  if (uiVersion === 'v2') {
    return <SkillBrowserClient />;
  }

  return <SkillsManager />;
}
