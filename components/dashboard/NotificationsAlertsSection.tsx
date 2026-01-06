'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, Info, CheckCircle2, X, UserPlus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationsAlertsSectionProps {
  notifications?: Notification[];
}

const typeConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  alert: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

// Mock notifications for demonstration
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Upcoming Lesson Today',
    message: 'You have 3 lessons scheduled for today starting at 2:00 PM',
    timestamp: new Date(),
    action: {
      label: 'View Schedule',
      href: '/dashboard/lessons',
    },
  },
  {
    id: '2',
    type: 'alert',
    title: 'Overdue Assignment',
    message: 'John Doe has 2 overdue assignments that need attention',
    timestamp: new Date(Date.now() - 3600000),
    action: {
      label: 'Review',
      href: '/dashboard/assignments',
    },
  },
  {
    id: '3',
    type: 'success',
    title: 'New Student Registered',
    message: 'Jane Smith has completed registration and is ready for their first lesson',
    timestamp: new Date(Date.now() - 7200000),
    action: {
      label: 'View Profile',
      href: '/dashboard/users',
    },
  },
];

export function NotificationsAlertsSection({
  notifications = MOCK_NOTIFICATIONS,
}: NotificationsAlertsSectionProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>(notifications);

  const dismissNotification = (id: string) => {
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const urgentCount = visibleNotifications.filter((n) => n.type === 'alert').length;
  const warningCount = visibleNotifications.filter((n) => n.type === 'warning').length;

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications & Alerts</CardTitle>
            {(urgentCount > 0 || warningCount > 0) && (
              <div className="flex gap-1">
                {urgentCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {urgentCount} urgent
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600 border-0">
                    {warningCount} warnings
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleNotifications([])}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
        <CardDescription>Important updates and reminders for your attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleNotifications.map((notification) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;

          return (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} relative group`}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dismissNotification(notification.id)}
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="flex gap-3">
                <div className={`flex-shrink-0 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1 pr-8">
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {format(notification.timestamp, 'MMM d, h:mm a')}
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
        })}
      </CardContent>
    </Card>
  );
}
