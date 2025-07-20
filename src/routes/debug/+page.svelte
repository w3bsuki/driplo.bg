<script>
	import { getLocale, locales } from '$lib/paraglide/runtime';
	import { getCookie } from '$lib/utils/cookies';
	import { getDebugLogs } from '$lib/utils/debug';
	import { onMount } from 'svelte';
	
	let locale = getLocale();
	let cookieValue = '';
	let debugLogs = [];
	let allCookies = '';
	
	onMount(() => {
		cookieValue = getCookie('locale') || 'Not set';
		debugLogs = getDebugLogs();
		allCookies = document.cookie || 'No cookies';
	});
</script>

<div class="max-w-4xl mx-auto p-8">
	<h1 class="text-2xl font-bold mb-6">Debug Information</h1>
	
	<div class="space-y-6">
		<div class="bg-gray-100 p-4 rounded">
			<h2 class="font-semibold mb-2">Language Configuration</h2>
			<ul class="space-y-1 text-sm">
				<li>Current Locale: <strong>{locale}</strong></li>
				<li>Available Languages: <strong>{locales.join(', ')}</strong></li>
				<li>Locale Cookie: <strong>{cookieValue}</strong></li>
			</ul>
		</div>
		
		<div class="bg-gray-100 p-4 rounded">
			<h2 class="font-semibold mb-2">All Cookies</h2>
			<pre class="text-xs whitespace-pre-wrap">{allCookies}</pre>
		</div>
		
		<div class="bg-gray-100 p-4 rounded">
			<h2 class="font-semibold mb-2">Debug Logs</h2>
			{#if debugLogs.length > 0}
				<div class="space-y-2 text-xs">
					{#each debugLogs as log}
						<div class="border-b pb-2">
							<div class="font-semibold">[{log.category}] {log.message}</div>
							<div class="text-gray-600">{log.timestamp}</div>
							{#if log.data}
								<pre class="text-xs mt-1">{JSON.stringify(log.data, null, 2)}</pre>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-600">No debug logs. Add ?debug=true to URL to enable logging.</p>
			{/if}
		</div>
		
		<div class="bg-blue-100 p-4 rounded">
			<h2 class="font-semibold mb-2">How to Debug</h2>
			<ol class="list-decimal list-inside text-sm space-y-1">
				<li>Add <code>?debug=true</code> to any URL to enable debug logging</li>
				<li>Try switching languages and check the logs</li>
				<li>Check browser console for additional errors</li>
				<li>Verify cookies are being set with correct domain</li>
			</ol>
		</div>
	</div>
</div>