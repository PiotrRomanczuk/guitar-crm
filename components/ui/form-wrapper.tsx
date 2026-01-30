'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * FormWrapper - Standard form container with Card layout
 * Follows CLAUDE.md Form Standards (Section 10)
 */
interface FormWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  error?: string | null;
  className?: string;
}

export function FormWrapper({
  children,
  title,
  description,
  error,
  className,
}: FormWrapperProps) {
  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * FormActions - Standard form button layout
 * Layout: flex-col-reverse on mobile, flex-row on desktop
 * Border-t separator, gap-3, pt-4
 */
interface FormActionsProps {
  children?: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
}

export function FormActions({
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isLoading = false,
  onCancel,
  showCancel = true,
  className,
}: FormActionsProps) {
  // If children provided, render them directly
  if (children) {
    return (
      <div
        className={cn(
          'flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border',
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border',
        className
      )}
    >
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? `${submitLabel.replace(/e$/, '')}ing...` : submitLabel}
      </Button>
      {showCancel && onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * FormSection - Group related fields with optional heading
 */
interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormSection({ children, title, description, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * FormGrid - Two-column grid for related fields
 */
interface FormGridProps {
  children: React.ReactNode;
  className?: string;
}

export function FormGrid({ children, className }: FormGridProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>{children}</div>
  );
}
