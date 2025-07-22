<script lang="ts">
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';
	import { getCookie } from '$lib/utils/cookies';
	import { browser } from '$app/environment';
	
	let currentLocale = $state(getLocale());
	let cookieValue = $state('');
	let testMessage = $state('');
	
	$effect(() => {
		if (browser) {
			currentLocale = getLocale();
			cookieValue = getCookie('PARAGLIDE_LOCALE') || 'not set';
			testMessage = m.header_home();
		}
	});
	
	function switchLocale(locale: string) {
		setLocale(locale as any);
	}
	
	function checkCookies() {
		if (browser) {
			const allCookies = document.cookie;
			console.log('All cookies:', allCookies);
			console.log('Locale cookie:', getCookie('locale'));
			console.log('PARAGLIDE_LOCALE cookie:', getCookie('PARAGLIDE_LOCALE'));
		}
	}
</script>

<div class="container mx-auto p-8">
	<h1 class="text-2xl font-bold mb-6">Locale Debug Page</h1>
	
	<div class="space-y-4">
		<div class="p-4 bg-gray-100 rounded">
			<h2 class="font-semibold mb-2">Current State:</h2>
			<p>Current Locale (getLocale()): <code class="bg-white px-2 py-1 rounded">{currentLocale}</code></p>
			<p>Cookie Value: <code class="bg-white px-2 py-1 rounded">{cookieValue}</code></p>
			<p>Available Locales: <code class="bg-white px-2 py-1 rounded">{JSON.stringify(locales)}</code></p>
			<p>Test Message (header_home): <code class="bg-white px-2 py-1 rounded">{testMessage}</code></p>
		</div>
		
		<div class="p-4 bg-blue-100 rounded">
			<h2 class="font-semibold mb-2">Switch Locale:</h2>
			<div class="flex gap-2">
				{#each locales as locale}
					<button 
						onclick={() => switchLocale(locale)}
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
						disabled={currentLocale === locale}
					>
						{locale === 'en' ? 'English' : 'Български'}
					</button>
				{/each}
			</div>
		</div>
		
		<div class="p-4 bg-green-100 rounded">
			<h2 class="font-semibold mb-2">Debug Actions:</h2>
			<button 
				onclick={checkCookies}
				class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
			>
				Check All Cookies (Console)
			</button>
		</div>
		
		<div class="p-4 bg-yellow-100 rounded">
			<h2 class="font-semibold mb-2">Test Translations:</h2>
			<div class="space-y-2">
				<p>header_home: {m.header_home()}</p>
				<p>header_browse: {m.header_browse()}</p>
				<p>header_settings: {m.header_settings()}</p>
				<p>auth_sign_in: {m.auth_sign_in()}</p>
			</div>
		</div>
	</div>
</div>