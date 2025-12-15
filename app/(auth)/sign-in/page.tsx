'use client';

import { useRouter } from 'next/navigation';
import { SignInForm } from '@/components/auth';
import { AnimatedText } from '@/components/auth/AnimatedText';
import { ArrowUp } from 'lucide-react';
import { DatabaseStatus } from '@/components/debug/DatabaseStatus';

export default function SignInPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex w-full bg-black">
      <DatabaseStatus />
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#1C1C1C]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">Log in</h1>
          </div>

          <SignInForm onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Right Side - Promo/Chat */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-black to-black"></div>

        {/* Colorful Glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-linear-to-tr from-orange-500 via-pink-500 to-purple-500 rounded-full blur-[120px] opacity-30 translate-y-1/4 translate-x-1/4"></div>

        <div className="relative z-10 w-full max-w-md px-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <AnimatedText />
              </div>
              <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
