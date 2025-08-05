<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { getLocale, localizeHref } from '$lib/paraglide/runtime.js'
	
	$: currentLanguage = getLocale()
	
	function switchToLanguage(newLang: string) {
		if (newLang === currentLanguage) return;
		
		// Get the current page path
		const currentPath = $page.url.pathname + $page.url.search + $page.url.hash;
		
		// Generate the localized URL for the new language
		const localizedUrl = localizeHref(currentPath, { locale: newLang as 'en' | 'bg' });
		
		// Navigate to the new localized URL
		goto(localizedUrl);
	}
</script>

<select onchange={(e) => switchToLanguage((e.target as HTMLSelectElement).value)} class="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
	<option value="en" selected={currentLanguage === 'en'}>English</option>
	<option value="bg" selected={currentLanguage === 'bg'}>Български</option>
</select>