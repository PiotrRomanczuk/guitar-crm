'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface IOSToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: 'default' | 'sm';
}

/**
 * iOS-style toggle switch component (51x31px default, matching iOS Human Interface Guidelines)
 * Uses Radix UI Switch primitive for accessibility
 */
const IOSToggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  IOSToggleProps
>(({ className, size = 'default', ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Off state
      'bg-muted dark:bg-muted',
      // On state - uses primary color (gold in Guitar CRM)
      'data-[state=checked]:bg-primary',
      // Size variants
      size === 'default' && 'h-[31px] w-[51px]',
      size === 'sm' && 'h-[24px] w-[40px]',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
        // Size variants for thumb
        size === 'default' && 'h-[27px] w-[27px] data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        size === 'sm' && 'h-[20px] w-[20px] data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
IOSToggle.displayName = 'IOSToggle';

export { IOSToggle, type IOSToggleProps };
