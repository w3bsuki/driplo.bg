<script lang="ts">
	import { User as UserIcon, ChevronDown } from 'lucide-svelte';
	import { DropdownMenu } from '$lib/components/ui';
	import { goto, invalidateAll } from '$app/navigation';
	import { unreadCount, initializeUnreadCount, subscribeToUnreadUpdates, unsubscribeFromUnreadUpdates } from '$lib/stores/messages';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database.types';
	import type { User } from '@supabase/supabase-js';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import DriploLogo from '$lib/components/ui/DriploLogo.svelte';
	import ProfileDropdownContent from './ProfileDropdownContent.svelte';
	import { onMount, onDestroy } from 'svelte';
	
	interface Props {
		supabase: SupabaseClient<Database>;
		user: User | null;
		profile: any;
		categories?: any[];
	}
	
	let { supabase, user, profile, categories }: Props = $props();
	
	let searchQuery = $state('');
	
	// Initialize unread count and real-time subscriptions
	onMount(() => {
		if (user) {
			initializeUnreadCount();
			subscribeToUnreadUpdates(user.id, supabase);
		}
	});

	onDestroy(() => {
		unsubscribeFromUnreadUpdates(supabase);
	});

	// Re-initialize when user changes
	$effect(() => {
		if (user) {
			initializeUnreadCount();
			subscribeToUnreadUpdates(user.id, supabase);
		}
	});
	
	// Cache brand slug
	let brandSlug = $state<string | null>(null);
	
	// Load brand slug when profile changes
	$effect(async () => {
		if (profile?.account_type === 'brand' && user) {
			const { data: brandData } = await supabase
				.from('brand_profiles')
				.select('brand_slug')
				.eq('user_id', user.id)
				.single();
			brandSlug = brandData?.brand_slug || null;
		} else {
			brandSlug = null;
		}
	});

	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			goto('/browse');
		}
	}

	async function handleSignOut() {
		// Sign out using Supabase client directly
		await supabase.auth.signOut();
		// Invalidate all server-side data
		await invalidateAll();
		// Redirect to home
		await goto('/');
	}
	
	// Badge mapping
	const badgeConfig: Record<string, { emoji: string; label: string }> = {
		brand: { emoji: '🏪', label: 'Brand' },
		top_seller: { emoji: '⭐', label: 'Top Seller' },
		verified: { emoji: '✅', label: 'Verified' },
		power_seller: { emoji: '🔥', label: 'Power Seller' },
		rising_star: { emoji: '🌟', label: 'Rising Star' },
		admin: { emoji: '👑', label: 'Admin' }
	};
</script>

<header class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
	<div class="container flex h-14 md:h-16 items-center gap-3 px-4">
		<!-- Logo -->
		<a href="/" class="flex items-center" aria-label="Driplo Home">
			<DriploLogo size="sm" className="md:hidden" />
			<DriploLogo size="md" className="hidden md:flex" />
		</a>
		
		<!-- Mobile Search Bar -->
		<div class="flex-1 mx-3 md:hidden">
			<div class="relative group">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">🔍</span>
				<input
					type="search"
					placeholder={m.header_search_placeholder()}
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					class="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-9 h-9 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
				/>
				{#if searchQuery.trim()}
					<button
						onclick={() => searchQuery = ''}
						class="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
						type="button"
						aria-label="Clear search"
					>
						<span class="text-gray-400 text-xs">✕</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Mobile Actions -->
		<div class="flex items-center gap-2 md:hidden">
			{#if user}
				<a 
					href="/messages" 
					class="relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-gray-50 transition-colors duration-fast"
					aria-label="Messages"
				>
					<span class="text-lg">💬</span>
					{#if $unreadCount > 0}
						<span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
							{$unreadCount > 9 ? '9+' : $unreadCount}
						</span>
					{/if}
				</a>
			{/if}
			
			<!-- Profile Dropdown -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="relative rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					aria-label="Account menu"
				>
					{#if user}
						<img 
							src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || user.email}`} 
							alt="Profile" 
							width="36"
							height="36"
							class="h-9 w-9 rounded-md object-cover border border-gray-200 hover:border-gray-300 transition-colors duration-fast" 
						/>
						{#if profile?.badges?.length && profile.badges.length > 0}
							<div class="absolute -top-1 -right-1 bg-white rounded-md px-1 border border-gray-200">
								<span class="text-xs" title={badgeConfig[profile.badges[0]]?.label}>
									{badgeConfig[profile.badges[0]]?.emoji}
								</span>
							</div>
						{/if}
					{:else}
						<div class="h-9 w-9 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200 hover:border-gray-300 transition-colors duration-fast">
							<UserIcon class="h-4 w-4 text-gray-600" />
						</div>
					{/if}
					<div class="absolute -bottom-0.5 -right-0.5 bg-white rounded-md p-0.5 border border-gray-200">
						<ChevronDown class="h-3 w-3 text-gray-600" />
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content 
					align="end" 
					sideOffset={8}
					class="w-72 rounded-lg border border-gray-200 bg-white p-0 shadow-lg"
				>
					<ProfileDropdownContent user={user} profile={profile} {brandSlug} onSignOut={handleSignOut} />
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Desktop Search Bar -->
		<div class="hidden md:block flex-1 max-w-2xl mx-6">
			<div class="relative group">
				<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">🔍</span>
				<input
					type="search"
					placeholder={m.header_search_placeholder()}
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					class="w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 h-11 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white focus:shadow-sm transition-all duration-200"
				/>
				{#if searchQuery.trim()}
					<button
						onclick={() => searchQuery = ''}
						class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
						type="button"
						aria-label="Clear search"
					>
						<span class="text-gray-400 text-sm">✕</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Desktop Actions -->
		<div class="hidden md:flex items-center gap-2">
			<LanguageSwitcher />
			<a href="/wishlist" class="p-2.5 rounded-md hover:bg-gray-50 transition-colors duration-fast">
				<span class="text-xl">❤️</span>
				<span class="sr-only">{m.header_favorites()}</span>
			</a>
			<a href="/orders" class="p-2.5 rounded-md hover:bg-gray-50 transition-colors duration-fast">
				<span class="text-xl">🛍️</span>
				<span class="sr-only">Orders</span>
			</a>
			<a href="/messages" class="relative p-2.5 rounded-md hover:bg-gray-50 transition-colors duration-fast">
				<span class="text-xl">💬</span>
				{#if $unreadCount > 0}
					<span class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
						{$unreadCount > 99 ? '99+' : $unreadCount}
					</span>
				{/if}
				<span class="sr-only">{m.header_messages()}</span>
			</a>
			
			<!-- Desktop Profile -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="relative rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					aria-label="Account menu"
				>
					{#if user}
						<img 
							src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || user.email}`} 
							alt="Profile" 
							class="h-10 w-10 rounded-md object-cover border border-gray-200 hover:border-gray-300 transition-colors duration-fast" 
						/>
						{#if profile?.badges?.length && profile.badges.length > 0}
							<div class="absolute -top-1 -right-1 bg-white rounded-md px-1 border border-gray-200">
								<span class="text-xs" title={badgeConfig[profile.badges[0]]?.label}>
									{badgeConfig[profile.badges[0]]?.emoji}
								</span>
							</div>
						{/if}
					{:else}
						<div class="h-10 w-10 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200 hover:border-gray-300 transition-colors duration-fast">
							<UserIcon class="h-5 w-5 text-gray-600" />
						</div>
					{/if}
					<div class="absolute -bottom-1 -right-1 bg-white rounded-md p-0.5 border border-gray-200">
						<ChevronDown class="h-3.5 w-3.5 text-gray-600" />
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content 
					align="end" 
					sideOffset={8}
					class="w-72 rounded-lg border border-gray-200 bg-white p-0 shadow-lg"
				>
					<ProfileDropdownContent user={user} profile={profile} {brandSlug} onSignOut={handleSignOut} />
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>