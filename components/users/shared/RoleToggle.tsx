'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { IOSToggle } from '@/components/ui/ios-toggle';
import { Shield, Music, GraduationCap, EyeOff } from 'lucide-react';

type UserRole = 'admin' | 'teacher' | 'student' | 'shadow';

interface RoleToggleProps {
  role: UserRole;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const roleConfig: Record<
  UserRole,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  admin: {
    label: 'Admin',
    description: 'Full system control',
    icon: Shield,
  },
  teacher: {
    label: 'Teacher',
    description: 'Can manage students & lessons',
    icon: Music,
  },
  student: {
    label: 'Student',
    description: 'Access to personal lessons',
    icon: GraduationCap,
  },
  shadow: {
    label: 'Shadow User',
    description: 'Read-only access to basic data',
    icon: EyeOff,
  },
};

/**
 * Role toggle component for user management
 * Shows role with icon, label, description, and iOS-style toggle
 */
function RoleToggle({
  role,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: RoleToggleProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <label
      className={cn(
        'relative flex items-center justify-between p-4 cursor-pointer group',
        'border-b border-border last:border-b-0',
        'hover:bg-muted/50 transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{config.label}</span>
          <span className="text-xs text-muted-foreground">{config.description}</span>
        </div>
      </div>
      <IOSToggle
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </label>
  );
}

export { RoleToggle, type UserRole };
