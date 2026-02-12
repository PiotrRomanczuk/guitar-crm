import { Button } from '@/components/ui/button';
import { AlertCircle, Info, X } from 'lucide-react';
import { format } from 'date-fns';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  action?: {
    label: string;
    href: string;
  };
}

const typeConfig = {
  info: {
    icon: Info,
    color: 'text-primary',
    bgColor: 'bg-primary/10 dark:bg-primary/20',
    borderColor: 'border-primary/20 dark:border-primary/30',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-warning dark:text-yellow-400',
    bgColor: 'bg-warning/10 dark:bg-yellow-900/20',
    borderColor: 'border-warning/20 dark:border-yellow-800',
  },
  alert: {
    icon: AlertCircle,
    color: 'text-destructive dark:text-red-400',
    bgColor: 'bg-destructive/10 dark:bg-red-900/20',
    borderColor: 'border-destructive/20 dark:border-red-800',
  },
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} relative group`}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Dismiss ${notification.title}`}
        onClick={() => onDismiss(notification.id)}
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="flex gap-3">
        <div className={`shrink-0 ${config.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1 pr-8">
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
            </p>
            {notification.action && (
              <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                <a href={notification.action.href}>{notification.action.label}</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
