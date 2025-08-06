<script lang="ts">
	import { page } from '$app/stores';
	import { Home, Heart, Search, Plus, MessageCircle, User } from 'lucide-svelte';
	import MobileFiltersDrawer from './MobileFiltersDrawer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { unreadCount } from '$lib/stores/messages';

	let { class: className = '' }: { class?: string } = $props();
	let showFilters = $state(false);

	const HIDDEN_PATHS = ['/orders', '/wishlist', '/checkout', '/messages', '/settings', '/profile/edit', '/onboarding'];
	const isVisible = $derived(!HIDDEN_PATHS.some(path => $page.url.pathname.startsWith(path)));

	// Dynamic nav items with professional icons
	const navItems = $derived(() => {
		const items = [];
		
		// Only show home if not on homepage (check with and without locale prefix)
		const isHomepage = $page.url.pathname === '/' || 
			$page.url.pathname === '/en' || 
			$page.url.pathname === '/bg';
		
		if (!isHomepage) {
			items.push({ href: '/', icon: Home, label: m.header_home() });
		}
		
		// Core navigation items with professional icons
		items.push(
			{ href: '/wishlist', icon: Heart, label: m.nav_wishlist() },
			{ href: '/browse', icon: Search, label: 'Search' },
			{ href: '/sell', icon: Plus, label: m.nav_sell(), highlight: true },
			{ href: '/messages', icon: MessageCircle, label: m.header_messages(), badge: $unreadCount },
			{ href: '/profile', icon: User, label: 'Profile' }
		);
		
		return items;
	});

	const isActive = (href: string) => $page.url.pathname === href || ($page.url.pathname.startsWith('/profile') && href === '/profile');
</script>

{#if isVisible}
<nav 
	class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden safe-area-pb {className}"
	role="navigation"
	aria-label="Mobile navigation"
>
	<div class="flex items-center justify-around px-2">
		{#each navItems() as item}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				class="relative flex flex-col items-center justify-center py-2 px-3 min-w-[60px] group transition-all duration-200 {item.highlight ? 'scale-110' : ''}"
				aria-current={active ? 'page' : undefined}
			>
				{#if item.highlight}
					<!-- Special sell button with solid background -->
					<div class="p-3 rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-200" style="background-color: oklch(27% 0.12 256);">
						<svelte:component 
							this={item.icon} 
							class="h-5 w-5 text-white" 
							stroke-width={2.5}
						/>
					</div>
				{:else}
					<!-- Regular nav items -->
					<div class="relative p-1">
						<svelte:component 
							this={item.icon} 
							class="h-5 w-5 transition-all duration-200 {active ? 'text-blue-600 scale-110' : 'text-gray-600 group-hover:text-gray-900'}" 
							stroke-width={active ? 2.5 : 2}
							fill={active && item.icon === Heart ? 'currentColor' : 'none'}
						/>
						{#if item.badge && item.badge > 0}
							<span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
								{item.badge > 9 ? '9+' : item.badge}
							</span>
						{/if}
					</div>
				{/if}
				<span class="text-[11px] mt-1 font-medium transition-colors duration-200 {active ? 'text-blue-600' : item.highlight ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}">
					{item.label}
				</span>
				{#if active && !item.highlight}
					<!-- Active indicator dot -->
					<div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
				{/if}
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
	
	/* Add subtle animation on tap for mobile */
	@media (hover: none) {
		a:active {
			transform: scale(0.95);
		}
	}
</style>