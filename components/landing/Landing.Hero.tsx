'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Organic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Warm gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

        {/* Flowing organic shapes */}
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Sound wave inspired curves */}
          <path
            d="M0,450 Q360,350 720,450 T1440,450"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          />
          <path
            d="M0,400 Q360,250 720,400 T1440,400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
          <path
            d="M0,500 Q360,550 720,500 T1440,500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
        </svg>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-2xl"
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Crafted for musicians</span>
        </div>

        {/* Main Heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          Where teaching
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-amber-500 bg-clip-text text-transparent">
              becomes artistry
            </span>
            {/* Underline decoration */}
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0,8 Q50,0 100,8 T200,8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          The complete studio management platform that feels as natural as playing.
          Built for guitar teachers who care about the craft, and students ready to grow.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
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
          <Button
            variant="outline"
            size="lg"
            className="group px-8 py-6 text-base border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <Play className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
            Watch demo
          </Button>
        </div>

        {/* Social proof */}
        <div
          className="mt-16 flex flex-col items-center gap-4 animate-fade-in"
          style={{ animationDelay: '500ms' }}
        >
          <div className="flex -space-x-3">
            {[
              'bg-amber-500',
              'bg-orange-500',
              'bg-rose-500',
              'bg-violet-500',
              'bg-blue-500',
            ].map((color, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${color} ring-2 ring-background flex items-center justify-center text-white text-xs font-medium`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Trusted by <span className="text-foreground font-medium">2,500+</span> guitar teachers worldwide
          </p>
        </div>
      </div>

      {/* Bottom fade for scroll indication */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent" />
      </div>
    </section>
  );
}
