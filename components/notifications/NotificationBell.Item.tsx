/**
 * NotificationBell.Item Component
 *
 * Individual notification item displayed in the notification bell dropdown.
 * Shows title, body, icon, timestamp, and optional action button.
 */

'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { InAppNotification } from '@/lib/services/in-app-notification-service';

interface NotificationBellItemProps {
  notification: InAppNotification;
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationBellItem({
  notification,
  onMarkAsRead,
}: NotificationBellItemProps) {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        'flex gap-3 p-3 hover:bg-accent transition-colors cursor-pointer border-b last:border-b-0',
        !notification.is_read && 'bg-blue-50 dark:bg-blue-950/20'
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        <span className="text-2xl" aria-hidden="true">
          {notification.icon || '🔔'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>

        {/* Body */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {notification.body}
        </p>

        {/* Footer: Timestamp + Action */}
        <div className="flex items-center justify-between gap-2">
          <time className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </time>

          {notification.action_label && (
            <span className="text-xs font-medium text-primary">
              {notification.action_label} →
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Wrap in Link if action_url exists
  if (notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
