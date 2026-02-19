import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { AIGenerationHistory } from '@/components/ai';

export default async function AIHistoryPage() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Generation History</h1>
        <p className="text-muted-foreground">Browse and manage all AI-generated content.</p>
      </div>
      <AIGenerationHistory />
    </div>
  );
}
