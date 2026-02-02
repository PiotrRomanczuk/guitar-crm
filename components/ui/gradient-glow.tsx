'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface GradientGlowProps {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
  active?: boolean;
}

/**
 * Wrapper component that adds a gradient glow effect around its children
 * Used for highlighting special elements like AI features, Spotify autofill, etc.
 */
function GradientGlow({
  children,
  className,
  glowClassName,
  active = true,
}: GradientGlowProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Glow effect - positioned behind the content */}
      {active && (
        <div
          className={cn(
            'absolute -inset-0.5 rounded-lg opacity-75 blur-sm',
            'bg-gradient-to-r from-primary via-primary/80 to-warning',
            'animate-pulse',
            glowClassName
          )}
          aria-hidden="true"
        />
      )}
      {/* Content container */}
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * AI Badge component - small badge indicating AI-powered features
 */
function AIBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'bg-primary/10 border border-primary/20',
        'text-primary text-[10px] font-bold uppercase tracking-wider',
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
      </span>
      AI
    </span>
  );
}

export { GradientGlow, AIBadge };
