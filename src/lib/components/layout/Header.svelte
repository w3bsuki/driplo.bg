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
	import NotificationDropdown from '$lib/components/notifications/NotificationDropdown.svelte';
	import { onMount, onDestroy } from 'svelte';
	
	interface Props {
		supabase: SupabaseClient<Database>;
		user: User | null;
		profile: any;
		categories?: any[];
	}
	
	let { supabase, user, profile, categories }: Props = $props();
	
	
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


	async function handleSignOut() {
		// Use server-side logout to properly clear cookies
		await goto('/logout');
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
		
		<!-- Mobile spacer -->
		<div class="flex-1 md:hidden"></div>

		<!-- Mobile Actions -->
		<div class="flex items-center gap-1 md:hidden">
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

		<!-- Desktop spacer -->
		<div class="hidden md:block flex-1"></div>

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

			<!-- Notifications (only for authenticated users) -->
			{#if user}
				<NotificationDropdown />
			{/if}
			
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