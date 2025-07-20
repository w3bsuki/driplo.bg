<script lang="ts">
	import { page } from '$app/stores';
	import MobileFiltersDrawer from './MobileFiltersDrawer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	let showFilters = $state(false);
	
	interface NavItem {
		href: string;
		emoji: string;
		label: string;
		isAction?: boolean;
		isPrimary?: boolean;
	}
	
	const navItems: NavItem[] = [
		{ href: '#filters', emoji: '📋', label: m.nav_filters(), isAction: true },
		{ href: '/browse', emoji: '🔍', label: m.header_browse() },
		{ href: '/sell', emoji: '➕', label: m.nav_sell(), isPrimary: true },
		{ href: '/wishlist', emoji: '❤️', label: m.nav_wishlist() },
		{ href: '/orders', emoji: '🛍️', label: 'Orders' }
	];
	
	function handleNavClick(item: NavItem) {
		if (item.isAction && item.href === '#filters') {
			showFilters = true;
		}
	}
	
	function isActive(item: NavItem): boolean {
		if (item.isAction) return false;
		return $page.url.pathname === item.href;
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden">
	<div class="grid grid-cols-5 items-center h-[72px] px-2" style="padding-bottom: env(safe-area-inset-bottom)">
		{#each navItems as item}
			{#if item.isPrimary}
				<!-- Primary Sell Button -->
				<a
					href={item.href}
					class="flex flex-col items-center justify-center py-2 relative group"
				>
					<div class="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#87CEEB] to-[#6BB6D8] text-white rounded-2xl shadow-lg shadow-[#87CEEB]/30 transform transition-transform active:scale-95 border-2 border-white">
						<span class="text-xl">{item.emoji}</span>
					</div>
				</a>
			{:else if item.isAction}
				<!-- Filter Action -->
				<button
					onclick={() => handleNavClick(item)}
					class="flex flex-col items-center justify-center gap-1 py-2 text-gray-500 hover:text-[#4F9FC5] active:scale-95 transition-all"
				>
					<div class="relative">
						<span class="text-xl opacity-80 hover:opacity-100 transition-opacity">{item.emoji}</span>
					</div>
					<span class="text-[11px] font-medium tracking-tight">{item.label}</span>
				</button>
			{:else}
				<!-- Regular Navigation -->
				<a
					href={item.href}
					class="flex flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-all {isActive(item) ? 'text-[#4F9FC5]' : 'text-gray-500 hover:text-[#4F9FC5]'}"
				>
					<div class="relative">
						<span class="text-xl transition-all {isActive(item) ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}">{item.emoji}</span>
						{#if isActive(item)}
							<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4F9FC5] rounded-full"></div>
						{/if}
					</div>
					<span class="text-[11px] font-medium tracking-tight">{item.label}</span>
				</a>
			{/if}
		{/each}
	</div>
</nav>

<MobileFiltersDrawer isOpen={showFilters} onClose={() => showFilters = false} />