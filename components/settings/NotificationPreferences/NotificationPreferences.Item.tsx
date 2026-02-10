'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { NotificationPreference } from '@/types/notifications';
import { getNotificationTypeInfo } from './notification-preferences.helpers';

interface NotificationPreferencesItemProps {
  preference: NotificationPreference;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Individual notification preference toggle item
 */
export function NotificationPreferencesItem({
  preference,
  onToggle,
  disabled = false,
}: NotificationPreferencesItemProps) {
  const info = getNotificationTypeInfo(preference.notification_type);

  if (!info) return null;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0 dark:border-border-dark">
      <div className="flex-1 pr-4">
        <Label
          htmlFor={`pref-${preference.notification_type}`}
          className="text-sm font-medium cursor-pointer"
        >
          {info.label}
        </Label>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mt-1">
          {info.description}
        </p>
      </div>
      <Switch
        id={`pref-${preference.notification_type}`}
        checked={preference.enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label={`Toggle ${info.label}`}
      />
    </div>
  );
}
