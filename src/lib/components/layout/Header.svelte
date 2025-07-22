<script lang="ts">
	import { Heart, MessageCircle, User, ChevronDown, ShoppingBag } from 'lucide-svelte';
	import { DropdownMenu } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { getAuthContext } from '$lib/stores/auth-context.svelte';
	import { unreadCount, initializeUnreadCount, subscribeToUnreadUpdates, unsubscribeFromUnreadUpdates } from '$lib/stores/messages';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import DriploLogo from '$lib/components/ui/DriploLogo.svelte';
	import ProfileDropdownContent from './ProfileDropdownContent.svelte';
	import { onMount, onDestroy } from 'svelte';
	
	interface Props {
		supabase: SupabaseClient<Database>;
	}
	
	let { supabase }: Props = $props();
	
	let searchQuery = $state('');
	
	// Get auth context
	const authContext = getAuthContext();

	// Initialize unread count and real-time subscriptions
	onMount(() => {
		if (authContext?.user) {
			initializeUnreadCount();
			subscribeToUnreadUpdates(authContext.user.id, supabase);
		}
	});

	onDestroy(() => {
		unsubscribeFromUnreadUpdates(supabase);
	});

	// Re-initialize when user changes
	$effect(() => {
		if (authContext?.user) {
			initializeUnreadCount();
			subscribeToUnreadUpdates(authContext.user.id, supabase);
		}
	});
	
	// Cache brand slug to avoid duplicate API calls
	let brandSlug = $state<string | null>(null);
	
	$effect(async () => {
		if (authContext?.profile?.account_type === 'brand' && authContext.user?.id) {
			const { data } = await authContext.supabase
				.from('brand_profiles')
				.select('brand_slug')
				.eq('user_id', authContext.user.id)
				.single();
			brandSlug = data?.brand_slug || null;
		}
	});

	function handleSearch() {
		if (searchQuery.trim()) {
			const params = new URLSearchParams();
			params.set('q', searchQuery.trim());
			goto(`/browse?${params.toString()}`);
		} else {
			goto('/browse');
		}
	}

	function navigateTo(path: string) {
		goto(path);
	}

	function handleSignOut() {
		if (authContext?.signOut) {
			authContext.signOut();
		}
	}
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
	<!-- Main Header -->
	<div class="container flex h-14 md:h-16 items-center px-3 md:px-4">
		<!-- Logo -->
		<a href="/" class="flex items-center mr-auto focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1" aria-label="Driplo Home">
			<DriploLogo size="sm" className="md:hidden" />
			<DriploLogo size="md" className="hidden md:flex" />
		</a>
		
		<!-- Mobile Actions -->
		<div class="flex md:hidden items-center ml-auto gap-1">
			<!-- Mobile Messages -->
			{#if authContext?.user}
				<a 
					href="/messages" 
					class="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
					aria-label="Messages"
				>
					<MessageCircle class="h-5 w-5 text-muted-foreground" />
					{#if $unreadCount > 0}
						<span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
							{$unreadCount > 9 ? '9+' : $unreadCount}
						</span>
					{/if}
				</a>
			{/if}
			
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="relative rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 transition-all duration-200 group hover:scale-105"
					aria-label="Account menu"
				>
					{#if authContext?.user}
						<img 
							src={authContext.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext.profile?.username || authContext.user.email}`} 
							alt="Profile" 
							width="36"
							height="36"
							class="h-9 w-9 rounded-full object-cover ring-2 ring-border group-hover:ring-accent/30" 
						/>
					{:else}
						<div class="h-9 w-9 rounded-full bg-background flex items-center justify-center ring-2 ring-border group-hover:ring-accent/30">
							<User class="h-4 w-4 text-muted-foreground" />
						</div>
					{/if}
					<!-- Dropdown Indicator -->
					<div class="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-md border border-border group-hover:bg-accent group-hover:border-accent transition-all">
						<ChevronDown class="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content 
					align="end" 
					sideOffset={8}
					class="w-64 rounded-xl border border-border bg-background/95 backdrop-blur-sm p-2 shadow-2xl z-50"
				>
					<ProfileDropdownContent {authContext} {brandSlug} onSignOut={handleSignOut} />
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Desktop Search Bar -->
		<div class="flex-1 max-w-2xl mx-2 md:mx-4 hidden md:block">
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🔍</span>
				<input
					type="search"
					placeholder={m.header_search_placeholder()}
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					class="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
				/>
			</div>
		</div>

		<!-- Desktop Actions -->
		<div class="hidden md:flex items-center space-x-2">
			<LanguageSwitcher />
			<a href="/wishlist" class="relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted">
				<Heart class="h-5 w-5 text-muted-foreground" />
				<span class="sr-only">{m.header_favorites()}</span>
			</a>
			<a href="/orders" class="relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted">
				<ShoppingBag class="h-5 w-5 text-muted-foreground" />
				<span class="sr-only">Orders</span>
			</a>
			<a href="/messages" class="relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted">
				<MessageCircle class="h-5 w-5 text-muted-foreground" />
				{#if $unreadCount > 0}
					<span class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
						{$unreadCount > 99 ? '99+' : $unreadCount}
					</span>
				{/if}
				<span class="sr-only">{m.header_messages()}</span>
			</a>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="relative rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 transition-all duration-200 group hover:scale-105"
					aria-label="Account menu"
				>
					{#if authContext?.user}
						<img 
							src={authContext.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext.profile?.username || authContext.user.email}`} 
							alt="Profile" 
							class="h-10 w-10 rounded-full object-cover ring-2 ring-border group-hover:ring-accent/30" 
						/>
					{:else}
						<div class="h-10 w-10 rounded-full bg-background flex items-center justify-center ring-2 ring-border group-hover:ring-accent/30">
							<User class="h-5 w-5 text-muted-foreground" />
						</div>
					{/if}
					<!-- Dropdown Indicator -->
					<div class="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-md border border-border group-hover:bg-accent group-hover:border-accent transition-all">
						<ChevronDown class="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content 
					align="end" 
					sideOffset={8}
					class="w-64 rounded-xl border border-border bg-background/95 backdrop-blur-sm p-2 shadow-2xl z-50"
				>
					<ProfileDropdownContent {authContext} {brandSlug} onSignOut={handleSignOut} />
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

	</div>
</header>