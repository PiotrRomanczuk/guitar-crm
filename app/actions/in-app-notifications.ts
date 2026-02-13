/**
 * In-App Notifications Server Actions
 *
 * UI-facing server actions for notification bell and notification center.
 * These actions are called from client components.
 */

'use server';

import { revalidatePath } from 'next/cache';
import {
  getUserNotifications as serviceGetUserNotifications,
  markAsRead as serviceMarkAsRead,
  markAllAsRead as serviceMarkAllAsRead,
  getUnreadCount as serviceGetUnreadCount,
  type InAppNotification,
  type GetUserNotificationsOptions,
} from '@/lib/services/in-app-notification-service';

/**
 * Get in-app notifications for the current user
 */
export async function getInAppNotifications(
  userId: string,
  options?: GetUserNotificationsOptions
): Promise<InAppNotification[]> {
  const notifications = await serviceGetUserNotifications(userId, options);
  return notifications;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const success = await serviceMarkAsRead(notificationId);

  if (success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/notifications');
  }

  return success;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const success = await serviceMarkAllAsRead(userId);

  if (success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/notifications');
  }

  return success;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return await serviceGetUnreadCount(userId);
}
