/**
 * useNotifications Hook
 *
 * Custom hook for managing in-app notifications with:
 * - Real-time Supabase subscription
 * - Unread count tracking
 * - Mark as read functionality
 * - Optimistic updates for instant UI feedback
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/app/actions/in-app-notifications';
import type { InAppNotification } from '@/lib/services/in-app-notification-service';

export interface UseNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
}

export function useNotifications(userId?: string, options: UseNotificationsOptions = {}) {
  const { limit = 20, unreadOnly = false } = options;

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('in_app_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${userId}`,
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit, unreadOnly]);

  async function fetchNotifications() {
    if (!userId) return;

    try {
      let query = supabase
        .from('in_app_notifications' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useNotifications] Fetch error:', error);
        setNotifications([]);
        setUnreadCount(0);
      } else {
        setNotifications((data as any) || []);
        setUnreadCount(((data as any)?.filter((n: any) => !n.is_read).length) || 0);
      }
    } catch (error) {
      console.error('[useNotifications] Fetch exception:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRealtimeUpdate(payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: InAppNotification;
    old: InAppNotification;
  }) {
    if (payload.eventType === 'INSERT') {
      // Add new notification to the top
      setNotifications((prev) => {
        const newNotifications = [payload.new, ...prev];
        // Respect limit
        return newNotifications.slice(0, limit);
      });

      // Increment unread count if unread
      if (!payload.new.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    } else if (payload.eventType === 'UPDATE') {
      // Update existing notification
      setNotifications((prev) =>
        prev.map((n) => (n.id === payload.new.id ? payload.new : n))
      );

      // Update unread count if read status changed
      if (payload.old && !payload.old.is_read && payload.new.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else if (payload.old && payload.old.is_read && !payload.new.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    } else if (payload.eventType === 'DELETE') {
      // Remove notification
      setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));

      // Decrement unread count if it was unread
      if (payload.old && !payload.old.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  }

  async function markAsRead(notificationId: string) {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Server update (will trigger realtime update, but we've already updated optimistically)
    const success = await markNotificationAsRead(notificationId);

    if (!success) {
      // Revert optimistic update on failure
      console.error('[useNotifications] Failed to mark as read');
      fetchNotifications();
    }
  }

  async function markAllAsRead() {
    if (!userId) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);

    // Server update
    const success = await markAllNotificationsAsRead(userId);

    if (!success) {
      // Revert optimistic update on failure
      console.error('[useNotifications] Failed to mark all as read');
      fetchNotifications();
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
