'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Shared auth form components
 * Follows CLAUDE.md Form Standards (Section 10)
 */

interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  'data-testid'?: string;
}

export function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder,
  autoComplete,
  className,
  'data-testid': testId,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        data-testid={testId}
        className={cn(error && 'border-destructive', className)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface AuthPasswordInputProps extends Omit<AuthInputProps, 'type'> {
  showPassword: boolean;
  onToggleShow: () => void;
  showHint?: string;
}

export function AuthPasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder = '••••••••',
  autoComplete,
  showPassword,
  onToggleShow,
  showHint,
  className,
  'data-testid': testId,
}: AuthPasswordInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          data-testid={testId}
          className={cn('pr-10', error && 'border-destructive', className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onToggleShow}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      {showHint && !error && (
        <p className="text-xs text-muted-foreground">{showHint}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface AuthAlertProps {
  message: string;
  variant?: 'error' | 'success';
}

export function AuthAlert({ message, variant = 'error' }: AuthAlertProps) {
  if (variant === 'success') {
    return (
      <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
        <AlertDescription className="text-green-700 dark:text-green-300">
          {message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = 'OR' }: AuthDividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-background text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

interface GoogleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function GoogleButton({ onClick, disabled, label = 'Continue with Google' }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="w-full"
    >
      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {label}
    </Button>
  );
}

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
}

export function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <a href={href} className="text-primary hover:underline">
      {children}
    </a>
  );
}

interface AuthFooterProps {
  children: React.ReactNode;
}

export function AuthFooter({ children }: AuthFooterProps) {
  return (
    <p className="text-center text-sm text-muted-foreground">{children}</p>
  );
}
