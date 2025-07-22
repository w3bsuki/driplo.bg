<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import MobileFiltersDrawer from './MobileFiltersDrawer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	// Constants
	const ANIMATION_DURATION = 200; // ms
	const ICON_SIZE = 'text-lg'; // 1.125rem
	const LABEL_SIZE = 'text-[10px]';
	const PRIMARY_BUTTON_SIZE = 'w-11 h-11';
	const MIN_TOUCH_TARGET = 'min-h-[44px]'; // WCAG 2.1 AAA standard
	
	// Props interface
	interface Props {
		class?: string;
	}
	
	let { class: className = '' }: Props = $props();
	
	// State
	let showFilters = $state(false);
	
	// Define pages where bottom nav should be hidden
	const HIDDEN_PATHS = [
		'/orders',
		'/wishlist',
		'/checkout',
		'/messages',
		'/settings',
		'/profile/edit',
		'/onboarding'
	] as const;
	
	// Derived state
	const isVisible = $derived(!HIDDEN_PATHS.some(path => $page.url.pathname.startsWith(path)));
	
	// Types
	interface NavItem {
		href: string;
		emoji: string;
		label: string;
		isAction?: boolean;
		isPrimary?: boolean;
		ariaLabel?: string;
	}
	
	// Navigation items with proper aria labels
	const navItems: NavItem[] = [
		{ 
			href: '#filters', 
			emoji: '⚙️', 
			label: m.nav_filters(), 
			isAction: true,
			ariaLabel: m.nav_filters_aria ? m.nav_filters_aria() : m.nav_filters()
		},
		{ 
			href: '/browse', 
			emoji: '💰', 
			label: m.nav_shop(),
			ariaLabel: m.nav_shop_aria ? m.nav_shop_aria() : m.nav_shop()
		},
		{ 
			href: '/sell', 
			emoji: '➕', 
			label: m.nav_sell(), 
			isPrimary: true,
			ariaLabel: m.nav_sell_aria ? m.nav_sell_aria() : m.nav_sell()
		},
		{ 
			href: '/wishlist', 
			emoji: '❤️', 
			label: m.nav_wishlist(),
			ariaLabel: m.nav_wishlist_aria ? m.nav_wishlist_aria() : m.nav_wishlist()
		},
		{ 
			href: '/leaderboard', 
			emoji: '⭐', 
			label: m.nav_sellers(),
			ariaLabel: m.nav_sellers_aria ? m.nav_sellers_aria() : m.nav_sellers()
		}
	];
	
	function handleNavClick(item: NavItem) {
		try {
			if (item.isAction && item.href === '#filters') {
				showFilters = true;
			}
		} catch (error) {
			console.error('Navigation error:', error);
		}
	}
	
	function isActive(item: NavItem): boolean {
		if (item.isAction) return false;
		return $page.url.pathname === item.href;
	}
</script>

{#if isVisible}
<nav 
	class="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg border-t border-border shadow-lg md:hidden {className}"
	role="navigation"
	aria-label={m.nav_mobile_navigation ? m.nav_mobile_navigation() : 'Mobile navigation'}
>
	<!-- Top accent line -->
	<div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden="true"></div>
	<div class="grid grid-cols-5 items-center h-14 px-3 pb-safe" role="list">
		{#each navItems as item (item.href)}
			<div role="listitem">
				{#if item.isPrimary}
					<!-- Primary Sell Button -->
					<a
						href={item.href}
						class="flex flex-col items-center justify-center py-1.5 relative group {MIN_TOUCH_TARGET}"
						aria-label={item.ariaLabel}
					>
						<div class="flex items-center justify-center {PRIMARY_BUTTON_SIZE} bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl shadow-lg shadow-primary/25 transform transition-all duration-{ANIMATION_DURATION} active:scale-95 hover:shadow-xl hover:shadow-primary/30 border-2 border-background/80">
							<span class="text-xl font-bold" aria-hidden="true">+</span>
						</div>
					</a>
				{:else if item.isAction}
					<!-- Filter Action -->
					<button
						onclick={() => handleNavClick(item)}
						class="flex flex-col items-center justify-center gap-0.5 py-1.5 text-muted-foreground hover:text-primary active:scale-95 transition-all duration-{ANIMATION_DURATION} {MIN_TOUCH_TARGET}"
						aria-label={item.ariaLabel}
						type="button"
					>
						<div class="relative">
							<span class="{ICON_SIZE} opacity-80 hover:opacity-100 transition-opacity" aria-hidden="true">{item.emoji}</span>
						</div>
						<span class="{LABEL_SIZE} font-medium tracking-tight leading-tight">{item.label}</span>
					</button>
				{:else}
					<!-- Regular Navigation -->
					<a
						href={item.href}
						class="flex flex-col items-center justify-center gap-0.5 py-1.5 active:scale-95 transition-all duration-{ANIMATION_DURATION} {MIN_TOUCH_TARGET} {isActive(item) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}"
						aria-label={item.ariaLabel}
						aria-current={isActive(item) ? 'page' : undefined}
					>
						<div class="relative">
							<span class="{ICON_SIZE} transition-all {isActive(item) ? 'opacity-100 scale-105' : 'opacity-80 hover:opacity-100'}" aria-hidden="true">{item.emoji}</span>
							{#if isActive(item)}
								<div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" aria-hidden="true"></div>
							{/if}
						</div>
						<span class="{LABEL_SIZE} font-medium tracking-tight leading-tight">{item.label}</span>
					</a>
				{/if}
			</div>
		{/each}
	</div>
</nav>
{/if}

<MobileFiltersDrawer isOpen={showFilters} onClose={() => showFilters = false} />

<style>
	/* Safe area padding for iOS devices */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	/* Ensure proper animation duration variables are set */
	.duration-200 {
		transition-duration: 200ms;
	}
</style>