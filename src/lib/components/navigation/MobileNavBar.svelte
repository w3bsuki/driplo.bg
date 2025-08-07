<script lang="ts">
	import { page } from '$app/stores';
	import { Heart, Search, Plus, User, MessageCircle } from 'lucide-svelte';
	import MobileNavItem from './MobileNavItem.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { cn } from '$lib/utils';
	import { navigation } from '$lib/stores/navigation.svelte';

	interface Props {
		class?: string;
	}
	
	let { class: className = '' }: Props = $props();

	// Check if navbar should be visible based on path
	const HIDDEN_PATHS = ['/orders', '/checkout', '/messages', '/settings', '/profile/edit', '/onboarding'];
	const isPathVisible = $derived(!HIDDEN_PATHS.some(path => $page.url.pathname.startsWith(path)));
	
	// Combine path visibility with smart navigation state
	const isVisible = $derived(isPathVisible && navigation.shouldShowBottomNav);

	// Always show consistent nav items - no conditional rendering based on page

	// Check if a route is active
	const isActive = (href: string) => {
		if (href === '/profile') return $page.url.pathname.startsWith('/profile');
		if (href === '/browse') return $page.url.pathname.startsWith('/browse');
		if (href === '/messages') return $page.url.pathname.startsWith('/messages');
		return $page.url.pathname === href;
	};
</script>

{#if isVisible}
<nav 
	class={cn(
		"fixed bottom-0 left-0 right-0 z-50",
		"bg-white/98 backdrop-blur-sm border-t border-gray-100",
		"md:hidden safe-area-pb shadow-[0_-4px_6px_-1px_rgb(0_0_0_/_0.05)]",
		className
	)}
	role="navigation"
	aria-label="Mobile navigation"
>
	<div class="flex items-center justify-around px-2 py-0.5">
		<MobileNavItem 
			href="/messages" 
			icon={MessageCircle} 
			label={m.nav_messages()}
			active={isActive('/messages')}
		/>
		
		<MobileNavItem 
			href="/browse" 
			icon={Search} 
			label={m.nav_search()}
			active={isActive('/browse')}
		/>
		
		<MobileNavItem 
			href="/sell" 
			icon={Plus} 
			label=""
			variant="primary"
			active={isActive('/sell')}
		/>
		
		<MobileNavItem 
			href="/wishlist" 
			icon={Heart} 
			label={m.nav_wishlist()}
			active={isActive('/wishlist')}
		/>
		
		<MobileNavItem 
			href="/profile" 
			icon={User} 
			label={m.nav_profile()}
			active={isActive('/profile')}
		/>
	</div>
</nav>
{/if}

<style>
	.safe-area-pb {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>