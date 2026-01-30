export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Not scheduled';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '-';
  // Handle HH:MM:SS format
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeString;
  }
}

import { getStatusBadgeClasses } from '@/lib/utils/status-colors';

export function getStatusColor(status: string | null | undefined): string {
  if (!status) return getStatusBadgeClasses('lesson', '');
  return getStatusBadgeClasses('lesson', status);
}
