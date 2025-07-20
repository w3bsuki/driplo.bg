import { getLocale, setLocale, localizeHref, deLocalizeHref } from "$lib/paraglide/runtime.js"

export const i18n = {
	getLocale,
	setLocale,
	localizeHref,
	deLocalizeHref,
	// Legacy method for compatibility
	route: (path) => deLocalizeHref(path)
};