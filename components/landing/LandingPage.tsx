'use client';

import { LandingHeader } from './Landing.Header';
import { LandingHero } from './Landing.Hero';
import { LandingFeatures } from './Landing.Features';
import { LandingTestimonials } from './Landing.Testimonials';
import { LandingCTA } from './Landing.CTA';
import { LandingFooter } from './Landing.Footer';
import { LandingChatButton } from './Landing.ChatButton';

export function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col w-full mx-auto overflow-x-hidden bg-[#221b10]">
      {/* Wood texture background */}
      <div
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingHeader />
        <main className="flex-1 flex flex-col">
          <LandingHero />
          <LandingFeatures />
          <LandingTestimonials />
          <LandingCTA />
        </main>
        <LandingFooter />
      </div>

      <LandingChatButton />
    </div>
  );
}
