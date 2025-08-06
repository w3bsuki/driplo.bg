<script lang="ts">
	import { page } from '$app/stores';
	import MobileFiltersDrawer from './MobileFiltersDrawer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { unreadCount } from '$lib/stores/messages';

	let { class: className = '' }: { class?: string } = $props();
	let showFilters = $state(false);

	const HIDDEN_PATHS = ['/orders', '/wishlist', '/checkout', '/messages', '/settings', '/profile/edit', '/onboarding'];
	const isVisible = $derived(!HIDDEN_PATHS.some(path => $page.url.pathname.startsWith(path)));

	// Dynamic nav items - remove home when on homepage
	const navItems = $derived(() => {
		const items = [];
		
		// Only show home if not on homepage (check with and without locale prefix)
		const isHomepage = $page.url.pathname === '/' || 
			$page.url.pathname === '/en' || 
			$page.url.pathname === '/bg';
		
		if (!isHomepage) {
			items.push({ href: '/', emoji: '🏠', label: m.header_home() });
		}
		
		// Core navigation items - Wishlist / Search / Sell / Messages / Profile
		items.push(
			{ href: '/wishlist', emoji: '❤️', label: m.nav_wishlist() },
			{ href: '/browse', emoji: '🔍', label: 'Search' },
			{ href: '/sell', emoji: '💰', label: m.nav_sell() },
			{ href: '/messages', emoji: '💬', label: m.header_messages(), badge: $unreadCount },
			{ href: '/profile', emoji: '👤', label: 'Profile' }
		);
		
		return items;
	});

	const isActive = (href: string) => $page.url.pathname === href || ($page.url.pathname.startsWith('/profile') && href === '/profile');
</script>

{#if isVisible}
<nav 
	class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-pb {className}"
	role="navigation"
	aria-label="Mobile navigation"
>
	<div class="flex">
		{#each navItems() as item}
			<a
				href={item.href}
				class="flex-1 flex flex-col items-center py-2.5 relative"
				aria-current={isActive(item.href) ? 'page' : undefined}
			>
				<span class="text-xl mb-0.5">{item.emoji}</span>
				{#if item.badge && item.badge > 0}
					<span class="absolute top-1 right-1/2 translate-x-3 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
						{item.badge > 9 ? '9+' : item.badge}
					</span>
				{/if}
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