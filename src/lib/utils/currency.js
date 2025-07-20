export function formatCurrency(amount, locale) {
	const currency = locale === 'bg' ? 'BGN' : 'USD';
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(amount);
}

export function getCurrencySymbol(locale) {
	return locale === 'bg' ? 'лв.' : '$';
}

export function getCurrencyCode(locale) {
	return locale === 'bg' ? 'BGN' : 'USD';
}