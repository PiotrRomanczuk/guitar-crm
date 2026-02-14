import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AuthLayout, AuthHeader } from '@/components/auth';
import AcceptInvitationForm from '@/components/auth/AcceptInvitationForm';

interface PageProps {
  searchParams: Promise<{ token?: string; type?: string }>;
}

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Check if already authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const hasToken = !!params.token;

  return (
    <AuthLayout>
      <AuthHeader
        title="Accept Your Invitation"
        subtitle="Set up your password to get started with Strummy."
      />

      {hasToken ? (
        <AcceptInvitationForm />
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          <p>This invitation link appears to be invalid or expired.</p>
          <p className="mt-2">
            Please contact your teacher for a new invitation, or{' '}
            <a href="/sign-up" className="text-primary hover:underline">
              create a new account
            </a>
            .
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
