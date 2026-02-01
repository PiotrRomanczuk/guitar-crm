'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music } from 'lucide-react';

export function LandingCTA() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background with organic shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-muted/50">
        {/* Flowing curves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-100,300 Q260,100 620,300 T1340,300 T2060,300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          />
          <path
            d="M-100,350 Q260,500 620,350 T1340,350 T2060,350"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
        </svg>

        {/* Glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-500 shadow-xl shadow-primary/30 mb-8">
          <Music className="w-8 h-8 text-primary-foreground" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Ready to transform
          <br />
          <span className="bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
            your teaching studio?
          </span>
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of guitar teachers who&apos;ve streamlined their studio,
          delighted their students, and rediscovered the joy of teaching.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/sign-up" prefetch={false}>
            <Button
              size="lg"
              className="group relative overflow-hidden px-8 py-6 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start your free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
          <Link href="/sign-in" prefetch={false}>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-base border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              Sign in to your account
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
