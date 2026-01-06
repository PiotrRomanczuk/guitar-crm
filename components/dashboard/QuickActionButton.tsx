import { Button } from '@/components/ui/button';
import { forwardRef, ReactNode, ComponentPropsWithoutRef } from 'react';

interface QuickActionButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, 'emoji'> {
  emoji: ReactNode;
  title: string;
  description: string;
}

export const QuickActionButton = forwardRef<HTMLButtonElement, QuickActionButtonProps>(
  ({ emoji, title, description, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        className={`h-auto flex-col items-start p-3 sm:p-4 w-full text-left whitespace-normal hover:border-primary hover:bg-primary/5 transition-all ${className}`}
        {...props}
      >
        <div className="font-semibold mb-1 text-sm sm:text-base flex items-center">
          {emoji} {title}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground font-normal">{description}</div>
      </Button>
    );
  }
);
QuickActionButton.displayName = 'QuickActionButton';
