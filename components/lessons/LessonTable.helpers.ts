export function formatDate(dateString: string | null | undefined): string {
	if (!dateString) return 'Not scheduled';
	try {
		const date = new Date(dateString);
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

export function getStatusColor(status: string | null | undefined): string {
	switch (status) {
		case 'COMPLETED':
			return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
		case 'CANCELLED':
			return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
		case 'IN_PROGRESS':
			return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
		case 'SCHEDULED':
			return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
		case 'RESCHEDULED':
			return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30';
		default:
			return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/30';
	}
}
