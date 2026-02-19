'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2 } from 'lucide-react';

interface AvatarEditorProps {
  src?: string;
  alt?: string;
  fallback?: string;
  onEdit?: () => void;
  lastChanged?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

/**
 * Avatar editor component with edit overlay
 * Shows user avatar with an edit button overlay
 */
function AvatarEditor({
  src,
  alt = 'User avatar',
  fallback = '?',
  onEdit,
  lastChanged,
  size = 'md',
  className,
}: AvatarEditorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <div className="relative group cursor-pointer" onClick={onEdit}>
        <Avatar
          className={cn(
            sizeClasses[size],
            'border-2 border-primary/30 shadow-lg shadow-primary/5'
          )}
        >
          <AvatarImage src={src} alt={alt} className="object-cover" />
          <AvatarFallback className="text-lg font-bold">{fallback}</AvatarFallback>
        </Avatar>
        {onEdit && (
          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 border-2 border-background flex items-center justify-center">
            <Edit2 className="h-3 w-3" />
          </div>
        )}
      </div>
      {lastChanged && (
        <p className="text-sm text-muted-foreground font-medium">
          Changed {lastChanged}
        </p>
      )}
    </div>
  );
}

export { AvatarEditor };
