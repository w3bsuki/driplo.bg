<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { i18n } from '$lib/i18n'
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js'
	import { setCookie } from '$lib/utils/cookies'
	
	$: currentLanguage = getLocale()
	
	function switchToLanguage(newLang: string) {
		if (newLang === currentLanguage) return;
		
		// Set locale cookie for persistence
		// Using PARAGLIDE_LOCALE as that's what Paraglide runtime expects
		setCookie('PARAGLIDE_LOCALE', newLang);
		
		// Set the locale in Paraglide runtime
		setLocale(newLang as 'en' | 'bg', { reload: false });
		
		// Reload the page to apply the new language
		// This ensures all server-side translations are loaded
		window.location.reload();
	}
</script>

<select onchange={(e) => switchToLanguage((e.target as HTMLSelectElement).value)} class="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
	<option value="en" selected={currentLanguage === 'en'}>English</option>
	<option value="bg" selected={currentLanguage === 'bg'}>Български</option>
</select>