'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInForm } from '@/components/auth';
import { AnimatedText } from '@/components/auth/AnimatedText';
import { ArrowUp } from 'lucide-react';
import { SimpleDatabaseStatus } from '@/components/debug/SimpleDatabaseStatus';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSuccess = () => {
    router.refresh();
    router.push('/');
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <SimpleDatabaseStatus />
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">Log in</h1>
          </div>

          <SignInForm onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Right Side - Promo/Chat */}
      <div className="hidden lg:flex w-1/2 bg-background relative overflow-hidden items-center justify-center">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-background"></div>

        {/* Warm Amber Glow - matches design system primary color */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-primary/40 via-primary/20 to-warning/30 rounded-full blur-[120px] opacity-40 translate-y-1/4 translate-x-1/4"></div>

        <div className="relative z-10 w-full max-w-md px-8">
          <div className="glass rounded-2xl p-4 border border-border shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <AnimatedText />
              </div>
              <button className="p-2 bg-primary/20 hover:bg-primary/30 rounded-full text-primary transition-colors">
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
