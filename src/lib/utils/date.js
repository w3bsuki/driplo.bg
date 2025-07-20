export function formatDate(date, locale) {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeZone: locale === 'bg' ? 'Europe/Sofia' : 'America/New_York'
	}).format(date);
}

export function formatDateTime(date, locale) {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: locale === 'bg' ? 'Europe/Sofia' : 'America/New_York'
	}).format(date);
}

export function formatRelativeTime(date, locale) {
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	const now = new Date();
	const diff = date - now;
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	
	if (Math.abs(days) >= 1) {
		return rtf.format(days, 'day');
	} else if (Math.abs(hours) >= 1) {
		return rtf.format(hours, 'hour');
	} else if (Math.abs(minutes) >= 1) {
		return rtf.format(minutes, 'minute');
	} else {
		return rtf.format(seconds, 'second');
	}
}