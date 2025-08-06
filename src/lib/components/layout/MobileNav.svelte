<script lang="ts">
	import { page } from '$app/stores';
	import MobileFiltersDrawer from './MobileFiltersDrawer.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { class: className = '' }: { class?: string } = $props();
	let showFilters = $state(false);

	const HIDDEN_PATHS = ['/orders', '/wishlist', '/checkout', '/messages', '/settings', '/profile/edit', '/onboarding'];
	const isVisible = $derived(!HIDDEN_PATHS.some(path => $page.url.pathname.startsWith(path)));

	const navItems = [
		{ href: '/', emoji: '🏠', label: m.header_home() },
		{ href: '/browse', emoji: '🔍', label: m.nav_shop() },
		{ href: '/sell', emoji: '💰', label: m.nav_sell() },
		{ href: '/wishlist', emoji: '❤️', label: m.nav_wishlist() },
		{ href: '/profile', emoji: '👤', label: 'Profile' }
	];

	const isActive = (href: string) => $page.url.pathname === href || ($page.url.pathname.startsWith('/profile') && href === '/profile');
</script>

{#if isVisible}
<nav 
	class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-pb {className}"
	role="navigation"
	aria-label="Mobile navigation"
>
	<div class="flex">
		{#each navItems as item}
			<a
				href={item.href}
				class="flex-1 flex flex-col items-center py-2.5"
				aria-current={isActive(item.href) ? 'page' : undefined}
			>
				<span class="text-xl mb-0.5">{item.emoji}</span>
				<span class="text-[10px] {isActive(item.href) ? 'text-black font-medium' : 'text-gray-600'}">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
{/if}

<MobileFiltersDrawer isOpen={showFilters} onClose={() => showFilters = false} />

<style>
	.safe-area-pb {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>