import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { Music } from 'lucide-react';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if already onboarded
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_student, is_teacher, is_admin')
    .eq('id', user.id)
    .single();

  if (profile?.is_student || profile?.is_teacher || profile?.is_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-background">
      {/* Subtle background gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Mobile container */}
      <div className="relative w-full max-w-md min-h-screen flex flex-col px-6 py-8">
        {/* Branding */}
        <div className="flex flex-col items-center mb-4">
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-card to-muted border border-border flex items-center justify-center shadow-lg p-4">
            <Music className="h-10 w-10 text-primary" />
          </div>
        </div>

        {/* Form */}
        <OnboardingForm user={user} />
      </div>
    </div>
  );
}
