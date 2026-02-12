'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { cardEntrance, staggerContainer, listItem } from '@/lib/animations';
import { NotificationItem, type Notification } from './NotificationItem';

async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

export function NotificationsAlertsSection() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 120000,
  });

  const dismissNotification = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visibleNotifications = (data ?? []).filter((n) => !dismissed.has(n.id));
  const urgentCount = visibleNotifications.filter((n) => n.type === 'alert').length;
  const warningCount = visibleNotifications.filter((n) => n.type === 'warning').length;

  if (error) {
    return (
      <motion.div variants={cardEntrance} initial="hidden" animate="visible">
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-destructive">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              Could not load notifications
            </CardTitle>
            <CardDescription>Something went wrong fetching your updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div variants={cardEntrance} initial="hidden" animate="visible">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                <Skeleton className="h-20 sm:h-24" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (visibleNotifications.length === 0) {
    return (
      <motion.div variants={cardEntrance} initial="hidden" animate="visible">
        <Card>
          <CardContent className="py-8 sm:py-10">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-500/20 mx-auto mb-3 flex items-center justify-center"
              >
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </motion.div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                No new notifications.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-base sm:text-lg">Notifications</CardTitle>
              {urgentCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {urgentCount} urgent
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-0">
                  {warningCount} warning{warningCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(new Set((data ?? []).map((n) => n.id)))}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <CardDescription>Important updates and reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visibleNotifications.map((notification) => (
                <motion.div key={notification.id} variants={listItem} layout>
                  <NotificationItem
                    notification={notification}
                    onDismiss={dismissNotification}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
