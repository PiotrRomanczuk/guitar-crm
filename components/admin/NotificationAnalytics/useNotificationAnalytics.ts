import { useQuery } from '@tanstack/react-query';
import type { NotificationAnalytics } from '@/types/notifications';

interface UseNotificationAnalyticsOptions {
  days: 7 | 30 | 90;
}

async function fetchNotificationAnalytics(days: number): Promise<NotificationAnalytics> {
  const res = await fetch(`/api/admin/notification-analytics?days=${days}`);
  if (!res.ok) {
    throw new Error('Failed to fetch notification analytics');
  }
  return res.json();
}

export function useNotificationAnalytics({ days }: UseNotificationAnalyticsOptions) {
  return useQuery<NotificationAnalytics>({
    queryKey: ['notification-analytics', days],
    queryFn: () => fetchNotificationAnalytics(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
