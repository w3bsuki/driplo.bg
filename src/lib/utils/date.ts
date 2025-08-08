/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const then = new Date(date);
	const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
	
	const intervals = [
		{ label: 'year', seconds: 31536000 },
		{ label: 'month', seconds: 2592000 },
		{ label: 'week', seconds: 604800 },
		{ label: 'day', seconds: 86400 },
		{ label: 'hour', seconds: 3600 },
		{ label: 'minute', seconds: 60 },
		{ label: 'second', seconds: 1 }
	];
	
	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) {
			return count === 1 
				? `1 ${interval.label} ago`
				: `${count} ${interval.label}s ago`;
		}
	}
	
	return 'just now';
}

/**
 * Format a date as a readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
	const d = new Date(date);
	return d.toLocaleDateString('en-US', options ?? {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
	const d = new Date(date);
	return d.toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
	const d = new Date(date);
	const today = new Date();
	return d.getDate() === today.getDate() &&
		d.getMonth() === today.getMonth() &&
		d.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
	const d = new Date(date);
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return d.getDate() === yesterday.getDate() &&
		d.getMonth() === yesterday.getMonth() &&
		d.getFullYear() === yesterday.getFullYear();
}

/**
 * Get time difference in specified unit
 */
export function getTimeDifference(date1: Date | string, date2: Date | string, unit: 'seconds' | 'minutes' | 'hours' | 'days' = 'days'): number {
	const d1 = new Date(date1);
	const d2 = new Date(date2);
	const diff = Math.abs(d1.getTime() - d2.getTime());
	
	switch (unit) {
		case 'seconds':
			return Math.floor(diff / 1000);
		case 'minutes':
			return Math.floor(diff / (1000 * 60));
		case 'hours':
			return Math.floor(diff / (1000 * 60 * 60));
		case 'days':
		default:
			return Math.floor(diff / (1000 * 60 * 60 * 24));
	}
}