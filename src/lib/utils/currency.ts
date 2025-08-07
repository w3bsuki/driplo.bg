import { getLocale } from '$lib/paraglide/runtime.js';

export function formatCurrency(amount: number, locale?: string): string {
	const currentLocale = locale || getLocale();
	const currency = currentLocale === 'bg' ? 'BGN' : 'USD';
	return new Intl.NumberFormat(currentLocale, {
		style: 'currency',
		currency
	}).format(amount);
}

export function getCurrencySymbol(locale?: string): string {
	const currentLocale = locale || getLocale();
	return currentLocale === 'bg' ? 'лв.' : '$';
}

export function getCurrencyCode(locale?: string): string {
	const currentLocale = locale || getLocale();
	return currentLocale === 'bg' ? 'BGN' : 'USD';
}