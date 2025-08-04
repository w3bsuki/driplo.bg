<script lang="ts">
	import { page } from '$app/stores';
	import MobileFiltersDrawer from './MobileFiltersDrawer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { logger } from '$lib/services/logger';
	
	interface Props {
		class?: string;
	}
	
	let { class: className = '' }: Props = $props();
	
	let showFilters = $state(false);
	
	const HIDDEN_PATHS = [
		'/orders',
		'/wishlist',
		'/checkout',
		'/messages',
		'/settings',
		'/profile/edit',
		'/onboarding'
	] as const;
	
	const isVisible = $derived(!HIDDEN_PATHS.some(path => $page.url.pathname.startsWith(path)));
	
	interface NavItem {
		href: string;
		emoji: string;
		label: string;
		isAction?: boolean;
		isPrimary?: boolean;
	}
	
	// Optimal C2C e-commerce navigation
	const navItems: NavItem[] = [
		{ 
			href: '/', 
			emoji: '🏠', 
			label: 'Home'
		},
		{ 
			href: '/browse', 
			emoji: '🔍', 
			label: 'Search'
		},
		{ 
			href: '/sell', 
			emoji: '💰', 
			label: 'Sell', 
			isPrimary: true
		},
		{ 
			href: '/wishlist', 
			emoji: '❤️', 
			label: 'Saved'
		},
		{ 
			href: '/profile', 
			emoji: '👤', 
			label: 'Profile'
		}
	];
	
	function handleNavClick(item: NavItem): void {
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
<nav 
	class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-pb {className}"
	role="navigation"
	aria-label="Mobile navigation"
>
	<div class="grid grid-cols-5">
		{#each navItems as item (item.href)}
			{#if item.isPrimary}
				<!-- Compact Primary Sell Button -->
				<a
					href={item.href}
					class="flex items-center justify-center py-1.5 px-1 group"
					aria-label="Create new listing"
				>
					<div class="flex items-center justify-center w-9 h-9 bg-black text-white rounded-full shadow-md transform transition-all duration-200 group-hover:scale-110 group-active:scale-95">
						<span class="text-xl">+</span>
					</div>
				</a>
			{:else if item.isAction}
				<!-- Filter Button -->
				<button
					onclick={() => handleNavClick(item)}
					class="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 transition-colors duration-200 hover:bg-gray-50 active:scale-95"
					type="button"
				>
					<span class="text-lg">{item.emoji}</span>
					<span class="text-[9px] font-medium text-gray-600">{item.label}</span>
				</button>
			{:else}
				<!-- Regular Nav Items -->
				<a
					href={item.href}
					class="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 transition-colors duration-200 hover:bg-gray-50 active:scale-95"
					aria-current={isActive(item) ? 'page' : undefined}
				>
					<div class="relative">
						<span class="text-lg {isActive(item) ? 'scale-110' : ''} transition-transform duration-200">
							{item.emoji}
						</span>
						{#if isActive(item)}
							<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
						{/if}
					</div>
					<span class="text-[9px] font-medium {isActive(item) ? 'text-black font-semibold' : 'text-gray-600'}">
						{item.label}
					</span>
				</a>
			{/if}
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