'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from './AnimatedSection';
import { LandingDashboardMockup } from './Landing.DashboardMockup';

export function LandingHero() {
  return (
    <section className="landing-gradient-hero pt-20 pb-24 lg:pt-28 lg:pb-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            Now in public beta
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground mb-6">
            The all-in-one platform for{' '}
            <span className="text-primary">guitar teachers</span>
          </h1>
          <p className="text-lg leading-[1.7] text-muted-foreground max-w-2xl mx-auto mb-8">
            Manage students, schedule lessons, track progress, and grow your studio — all in one
            beautiful place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="rounded-full px-8 py-6 text-base font-semibold shadow-lg"
            >
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-8 py-6 text-base font-medium border-border text-foreground hover:bg-secondary"
            >
              <Play size={16} className="mr-2" /> See it in action
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="landing-perspective-tilt mx-auto max-w-5xl">
            <LandingDashboardMockup />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
