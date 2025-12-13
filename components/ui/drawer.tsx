'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);

function useDrawer() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be used within a Drawer');
  }
  return context;
}

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Drawer({ open = false, onOpenChange, children }: DrawerProps) {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  return (
    <DrawerContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DrawerContext.Provider>
  );
}

function DrawerTrigger({
  children,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { onOpenChange } = useDrawer();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        onOpenChange(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (children as any).props.onClick?.(e);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  return (
    <button {...props} onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}

function DrawerPortal({ children }: { children: React.ReactNode }) {
  const { open } = useDrawer();

  if (!open) return null;

  return (
    <>{typeof document !== 'undefined' && document.body && createPortal(children, document.body)}</>
  );
}

function DrawerOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, onOpenChange } = useDrawer();

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      data-state={open ? 'open' : 'closed'}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  const { open, onOpenChange } = useDrawer();
  const [startY, setStartY] = React.useState<number | null>(null);
  const [currentY, setCurrentY] = React.useState<number | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const currentTouchY = e.touches[0].clientY;
    const diff = currentTouchY - startY;

    // Only track downward swipes
    if (diff > 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (currentY !== null && currentY > 150) {
      onOpenChange(false);
    }
    setStartY(null);
    setCurrentY(null);
  };

  if (!open) return null;

  const translateY = currentY !== null && currentY > 0 ? currentY : 0;

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div
        ref={contentRef}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mt-24 flex flex-col rounded-t-[10px] border border-border bg-background',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          'data-[state=closed]:duration-300 data-[state=open]:duration-500',
          className
        )}
        data-state={open ? 'open' : 'closed'}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: currentY === null ? 'transform 0.3s ease-out' : 'none',
          maxHeight: '90vh',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* Drag handle */}
        <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-muted-foreground/20" />

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-center sm:text-left p-6 pb-4', className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4',
        className
      )}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function DrawerClose({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useDrawer();

  return (
    <button className={cn(className)} onClick={() => onOpenChange(false)} {...props}>
      {children}
    </button>
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
};
