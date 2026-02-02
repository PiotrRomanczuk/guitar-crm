'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingCTA() {
  return (
    <section className="relative px-6 lg:px-8 py-24 bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-[#181511] dark:to-[#0f0d0a] text-center overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300 dark:via-[#3a2e22] to-transparent" />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to tune up your business?
        </h3>
        <p className="text-gray-600 dark:text-[#b9af9d] text-lg mb-10">
          Join thousands of instructors elevating their teaching game today. Start your
          14-day free trial.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button
            asChild
            className="px-8 py-4 h-auto bg-[#ec9c13] hover:bg-amber-600 text-[#181511] font-bold rounded-lg shadow-lg shadow-amber-900/20 text-lg transition-transform hover:-translate-y-1"
          >
            <Link href="/sign-up">Get Started Now</Link>
          </Button>
          <Button
            variant="outline"
            className="px-8 py-4 h-auto bg-white dark:bg-[#2e261d] border border-[#ec9c13]/30 text-[#d4880f] dark:text-[#ec9c13] hover:bg-amber-50 dark:hover:bg-[#3a2e22] font-bold rounded-lg transition-all duration-300 text-lg"
          >
            View All Features
          </Button>
        </div>
      </div>
    </section>
  );
}
