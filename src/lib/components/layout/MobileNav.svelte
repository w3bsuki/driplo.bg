<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import MobileFiltersDrawer from './MobileFiltersDrawer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	let showFilters = $state(false);
	
	// Define pages where bottom nav should be hidden
	const hiddenPaths = [
		'/orders',
		'/wishlist',
		'/checkout',
		'/messages',
		'/settings',
		'/profile/edit'
	];
	
	const isVisible = $derived(!hiddenPaths.some(path => $page.url.pathname.startsWith(path)));
	
	interface NavItem {
		href: string;
		emoji: string;
		label: string;
		isAction?: boolean;
		isPrimary?: boolean;
	}
	
	const navItems: NavItem[] = [
		{ href: '#filters', emoji: '⚙️', label: m.nav_filters(), isAction: true },
		{ href: '/browse', emoji: '💰', label: m.nav_shop() },
		{ href: '/sell', emoji: '➕', label: m.nav_sell(), isPrimary: true },
		{ href: '/wishlist', emoji: '❤️', label: m.nav_wishlist() },
		{ href: '/leaderboard', emoji: '⭐', label: m.nav_sellers() }
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

{#if isVisible}
<nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-t border-gray-100 shadow-lg md:hidden">
	<!-- Top accent line -->
	<div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#87CEEB]/20 to-transparent"></div>
	<div class="grid grid-cols-5 items-center h-14 px-3" style="padding-bottom: env(safe-area-inset-bottom)">
		{#each navItems as item (item.href)}
			{#if item.isPrimary}
				<!-- Primary Sell Button -->
				<a
					href={item.href}
					class="flex flex-col items-center justify-center py-1.5 relative group touch-safe"
				>
					<div class="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-[#87CEEB] to-[#6BB6D8] text-white rounded-2xl shadow-lg shadow-[#87CEEB]/25 transform transition-all duration-200 active:scale-95 hover:shadow-xl hover:shadow-[#87CEEB]/30 border-2 border-white/80">
						<span class="text-xl font-bold">+</span>
					</div>
				</a>
			{:else if item.isAction}
				<!-- Filter Action -->
				<button
					onclick={() => handleNavClick(item)}
					class="flex flex-col items-center justify-center gap-0.5 py-1.5 text-gray-500 hover:text-[#4F9FC5] active:scale-95 transition-all duration-150 touch-safe min-h-[36px]"
				>
					<div class="relative">
						<span class="text-lg opacity-80 hover:opacity-100 transition-opacity">{item.emoji}</span>
					</div>
					<span class="text-[10px] font-medium tracking-tight leading-tight">{item.label}</span>
				</button>
			{:else}
				<!-- Regular Navigation -->
				<a
					href={item.href}
					class="flex flex-col items-center justify-center gap-0.5 py-1.5 active:scale-95 transition-all duration-150 touch-safe min-h-[36px] {isActive(item) ? 'text-[#4F9FC5]' : 'text-gray-500 hover:text-[#4F9FC5]'}"
				>
					<div class="relative">
						<span class="text-lg transition-all {isActive(item) ? 'opacity-100 scale-105' : 'opacity-80 hover:opacity-100'}">{item.emoji}</span>
						{#if isActive(item)}
							<div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4F9FC5] rounded-full animate-pulse"></div>
						{/if}
					</div>
					<span class="text-[10px] font-medium tracking-tight leading-tight">{item.label}</span>
				</a>
			{/if}
		{/each}
	</div>
</nav>
{/if}

<MobileFiltersDrawer isOpen={showFilters} onClose={() => showFilters = false} />