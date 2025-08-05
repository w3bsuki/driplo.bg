<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { getLocale, localizeHref, setLocale } from '$lib/paraglide/runtime.js'
	import { browser, dev } from '$app/environment'
	
	$: currentLanguage = getLocale()
	
	async function switchToLanguage(newLang: string) {
		if (newLang === currentLanguage) return;
		
		// Set the PARAGLIDE_LOCALE cookie before navigation
		if (browser) {
			// Set cookie for 1 year, matching hooks.server.ts configuration
			const secure = !dev ? '; secure' : '';
			document.cookie = `PARAGLIDE_LOCALE=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax${secure}`;
			
			// Update the runtime locale
			setLocale(newLang as 'en' | 'bg');
		}
		
		// Get the current page path without any existing locale prefix
		let currentPath = $page.url.pathname;
		const search = $page.url.search;
		const hash = $page.url.hash;
		
		// Remove existing locale prefix if present (e.g., /bg/browse -> /browse)
		if (currentPath.startsWith('/bg')) {
			currentPath = currentPath.substring(3) || '/';
		} else if (currentPath.startsWith('/en')) {
			currentPath = currentPath.substring(3) || '/';
		}
		
		// Add the search and hash back
		const fullPath = currentPath + search + hash;
		
		// Generate the localized URL for the new language
		const localizedUrl = localizeHref(fullPath, { locale: newLang as 'en' | 'bg' });
		
		// Navigate to the new localized URL
		await goto(localizedUrl, { replaceState: true });
	}
</script>

<select onchange={(e) => switchToLanguage((e.target as HTMLSelectElement).value)} class="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
	<option value="en" selected={currentLanguage === 'en'}>English</option>
	<option value="bg" selected={currentLanguage === 'bg'}>Български</option>
</select>