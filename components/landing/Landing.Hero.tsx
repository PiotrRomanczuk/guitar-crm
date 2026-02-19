'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative min-h-[700px] w-full flex items-center overflow-hidden">
      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(255, 251, 245, 0.97) 0%,
              rgba(255, 251, 245, 0.9) 40%,
              rgba(255, 251, 245, 0.7) 60%,
              rgba(255, 251, 245, 0.4) 100%
            ),
            url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgMEHpTaF9WLMKbOFVvr_bXFt0kEKGRu7u4FGGUqwE6YrEj6nIInRodEjNrhY-GNc3x2IOIs3_TzG2dD6YR4ryfpayrcM5_yxDlC8dAMsc_JaDtkHj7N9_dIAwP7VMdYi_VUKbsEwiJnJpEFSzh1iPbdWO_LoV4P2-tnvZZz-CXRUT95LGkl7pAXH_07QYMzeaB-WOYkMLhKIXAuY6dFqrjb6RELYejo2jyI5k9YIox_4CFH6LUO-SZ9jTdANPW8kAFGpgejFdTwk')
          `,
        }}
      />
      {/* Dark mode overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(24, 21, 17, 0.95) 0%,
              rgba(24, 21, 17, 0.8) 40%,
              rgba(24, 21, 17, 0.4) 60%,
              rgba(24, 21, 17, 0) 100%
            ),
            url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgMEHpTaF9WLMKbOFVvr_bXFt0kEKGRu7u4FGGUqwE6YrEj6nIInRodEjNrhY-GNc3x2IOIs3_TzG2dD6YR4ryfpayrcM5_yxDlC8dAMsc_JaDtkHj7N9_dIAwP7VMdYi_VUKbsEwiJnJpEFSzh1iPbdWO_LoV4P2-tnvZZz-CXRUT95LGkl7pAXH_07QYMzeaB-WOYkMLhKIXAuY6dFqrjb6RELYejo2jyI5k9YIox_4CFH6LUO-SZ9jTdANPW8kAFGpgejFdTwk')
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 max-w-2xl py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ec9c13]/10 dark:bg-[#ec9c13]/20 border border-[#ec9c13]/20 dark:border-[#ec9c13]/30 w-fit backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#ec9c13] animate-pulse" />
            <span className="text-sm font-bold text-[#b8860b] dark:text-[#ec9c13] uppercase tracking-wide">
              New: Tab Editor
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight drop-shadow-sm">
            Elevate Your <br />
            <span className="text-[#d4880f] dark:text-[#ec9c13]">Guitar Teaching</span>
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl leading-relaxed max-w-lg">
            The premium platform for professional instructors and dedicated students. Crafted
            for your studio, designed for your success.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="h-14 px-8 bg-[#ec9c13] hover:bg-amber-600 text-[#181511] font-bold text-lg rounded-lg shadow-lg shadow-amber-900/20 transition-transform active:scale-[0.98]"
            >
              <Link href="/sign-up" className="flex items-center gap-2">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-14 px-8 border border-amber-300 dark:border-[#3a2e22] hover:border-[#ec9c13]/50 bg-white/50 dark:bg-[#221b10]/50 text-gray-900 dark:text-white font-bold text-lg rounded-lg backdrop-blur-sm transition-colors"
            >
              View Demo
            </Button>
          </div>

          {/* Trust text */}
          <p className="text-sm text-gray-500 dark:text-[#b9af9d] mt-2">
            No credit card required • 14-day free trial
          </p>
        </div>
      </div>
    </section>
  );
}
