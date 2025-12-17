import { createClient } from '@/lib/supabase/server';
import SkillsManager from '@/components/skills/SkillsManager';
import { Skill } from '@/types/skills';

export const metadata = {
  title: 'Skills Management',
  description: 'Manage the master list of skills',
};

export default async function SkillsPage() {
  const supabase = await createClient();

  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('is_student', true)
    .order('full_name', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Skills Management</h1>
      <SkillsManager 
        initialSkills={(skills as Skill[]) || []} 
        students={students || []}
      />
    </div>
  );
}
