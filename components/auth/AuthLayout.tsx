'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Music } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Auth layout component with centered container, branding icon, and gradient background
 * Used for sign-in, sign-up, and password reset pages
 */
function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      {/* Subtle background gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Main container */}
      <div className={cn('relative w-full max-w-[400px] flex flex-col gap-6', className)}>
        {children}
      </div>
    </div>
  );
}

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Auth header with branding icon, title, and optional subtitle
 */
function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Branding Icon */}
      <div className="mb-6 rounded-full bg-primary/10 p-4 ring-1 ring-primary/20">
        <Music className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-center text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * Divider with "OR" text between auth methods
 */
function AuthDivider({ text = 'OR' }: { text?: string }) {
  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-border" />
      <span className="mx-4 flex-shrink-0 text-xs text-muted-foreground uppercase tracking-wider">
        {text}
      </span>
      <div className="flex-grow border-t border-border" />
    </div>
  );
}

export { AuthLayout, AuthHeader, AuthDivider };
