'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface AIAssistButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
}

/**
 * AI Assist button with gold gradient glow and shimmer animation on hover
 * Used for AI-powered features like generating lesson plans, summaries, song suggestions
 */
function AIAssistButton({
  onClick,
  disabled = false,
  loading = false,
  label = 'AI Assist',
  className,
}: AIAssistButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative group flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-gradient-to-r from-primary/10 to-warning/10',
        'hover:from-primary/20 hover:to-warning/20',
        'transition-all duration-300',
        'border border-primary/20',
        'shadow-[0_0_15px_hsl(var(--primary)/0.15)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'overflow-hidden',
        className
      )}
    >
      {/* Icon */}
      <Sparkles
        className={cn(
          'h-4 w-4 text-primary',
          'group-hover:scale-110 transition-transform duration-300',
          loading && 'animate-spin'
        )}
      />

      {/* Label */}
      <span className="text-xs font-bold text-primary uppercase tracking-wide">
        {loading ? 'Working...' : label}
      </span>

      {/* Shimmer effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-r from-transparent via-white/20 to-transparent',
          'translate-x-[-100%] group-hover:translate-x-[100%]',
          'transition-transform duration-700',
          'pointer-events-none'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * AI Toolbar with multiple action chips
 * Used in lesson detail view for various AI actions
 */
interface AIToolbarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface AIToolbarProps {
  actions: AIToolbarAction[];
  className?: string;
}

function AIToolbar({ actions, className }: AIToolbarProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'bg-muted hover:bg-primary/10',
            'text-xs font-medium text-muted-foreground hover:text-primary',
            'transition-colors duration-200',
            'border border-transparent hover:border-primary/20'
          )}
        >
          {action.icon || <Sparkles className="h-3 w-3" />}
          {action.label}
        </button>
      ))}
    </div>
  );
}

export { AIAssistButton, AIToolbar, type AIToolbarAction };
