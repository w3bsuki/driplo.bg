<script lang="ts">
	import { Search, Heart, MessageCircle, User, Menu, Camera, Home, LogOut, ShoppingBag } from 'lucide-svelte';
	import { Button, DropdownMenu } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { getAuthContext } from '$lib/stores/auth-context.svelte';
	import { unreadCount, initializeUnreadCount, subscribeToUnreadUpdates, unsubscribeFromUnreadUpdates } from '$lib/stores/messages';
	import type { Category } from '$lib/types';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import { onMount, onDestroy } from 'svelte';
	
	interface Props {
		categories?: Category[];
	}
	
	let { categories = [] }: Props = $props();
	
	let searchQuery = $state('');
	let activeCategory = $state('');
	
	// Get auth context
	const authContext = getAuthContext();

	// Initialize unread count and real-time subscriptions
	onMount(() => {
		if (authContext?.user) {
			initializeUnreadCount();
			subscribeToUnreadUpdates(authContext.user.id);
		}
	});

	onDestroy(() => {
		unsubscribeFromUnreadUpdates();
	});

	// Re-initialize when user changes
	$effect(() => {
		if (authContext?.user) {
			initializeUnreadCount();
			subscribeToUnreadUpdates(authContext.user.id);
		}
	});
	
	const quickCategories = $derived(
		categories.map(cat => ({ 
			name: cat.name, 
			value: cat.slug, 
			slug: cat.slug,
			icon: cat.icon || '📦'
		}))
	);

	function handleSearch() {
		if (searchQuery.trim()) {
			const params = new URLSearchParams();
			params.set('q', searchQuery.trim());
			goto(`/browse?${params.toString()}`);
		} else {
			goto('/browse');
		}
	}

	function selectCategory(category: string) {
		activeCategory = category;
		if (category) {
			// Navigate to dedicated category page
			goto(`/${category}`);
		} else {
			// Navigate to browse all
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

<header class="sticky top-0 z-50 w-full border-b bg-white">
	<!-- Main Header -->
	<div class="container flex h-16 items-center px-4">
		<!-- Mobile Menu Dropdown -->
		<div class="flex md:hidden items-center mr-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
					aria-label="Toggle menu"
				>
					<Menu class="h-5 w-5 text-gray-600" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content 
					align="start" 
					sideOffset={8}
					class="w-72 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-md z-50"
				>
					<!-- Navigation Items -->
					<DropdownMenu.Group>
						<DropdownMenu.Item
							onclick={() => navigateTo('/')}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:outline-none"
						>
							<div class="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
								<Home class="h-4 w-4 text-gray-600" />
							</div>
							{m.header_home()}
						</DropdownMenu.Item>
						
						<DropdownMenu.Item
							onclick={() => navigateTo('/browse')}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
						>
							<div class="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
								<Search class="h-4 w-4 text-gray-600" />
							</div>
							{m.header_browse()}
						</DropdownMenu.Item>
						
						<DropdownMenu.Item
							onclick={() => navigateTo('/sell')}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 cursor-pointer"
						>
							<div class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
								<Camera class="h-4 w-4 text-white" />
							</div>
							{m.header_sell_item()}
						</DropdownMenu.Item>
						
						<DropdownMenu.Item
							onclick={() => navigateTo('/orders')}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
						>
							<div class="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
								<ShoppingBag class="h-4 w-4 text-gray-600" />
							</div>
							Orders
						</DropdownMenu.Item>
						
						<DropdownMenu.Item
							onclick={() => navigateTo('/messages')}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
						>
							<div class="relative h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
								<MessageCircle class="h-4 w-4 text-gray-600" />
								{#if $unreadCount > 0}
									<span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
										{$unreadCount > 9 ? '9+' : $unreadCount}
									</span>
								{/if}
							</div>
							{m.header_messages()}
						</DropdownMenu.Item>
						
						<DropdownMenu.Item
							onclick={() => navigateTo('/wishlist')}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
						>
							<div class="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
								<Heart class="h-4 w-4 text-gray-600" />
							</div>
							{m.header_favorites()}
						</DropdownMenu.Item>
					</DropdownMenu.Group>
					
					<!-- Profile Section -->
					{#if authContext?.user}
						<DropdownMenu.Separator class="my-2 bg-gray-200" />
						<DropdownMenu.Group>
							<DropdownMenu.Label class="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
								Account
							</DropdownMenu.Label>
							<DropdownMenu.Item
								onclick={() => navigateTo(authContext.profile?.username ? `/profile/${authContext.profile.username}` : '/profile')}
								class="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-100 cursor-pointer"
							>
								{#if authContext.profile?.avatar_url}
									<img src={authContext.profile.avatar_url} alt="Profile" class="h-10 w-10 rounded-lg object-cover" />
								{:else}
									<div class="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
										<span class="text-white font-semibold text-sm">{(authContext.profile?.full_name || authContext.profile?.username || authContext.user.email)?.charAt(0).toUpperCase()}</span>
									</div>
								{/if}
								<div class="flex-1">
									<p class="text-sm font-medium text-gray-900">{authContext.profile?.full_name || authContext.profile?.username || 'My Profile'}</p>
									<p class="text-xs text-gray-500">View profile</p>
								</div>
							</DropdownMenu.Item>
							
							<DropdownMenu.Item
								onclick={() => navigateTo('/profile/settings')}
								class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
							>
								<div class="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
									<User class="h-4 w-4 text-gray-600" />
								</div>
								{m.header_settings()}
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					{:else}
						<DropdownMenu.Separator class="my-2 bg-gray-200" />
						<DropdownMenu.Item
							onclick={() => navigateTo('/login')}
							class="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium cursor-pointer"
						>
							<User class="h-4 w-4" />
							{m.header_sign_in()}
						</DropdownMenu.Item>
					{/if}
					
					<!-- Categories Section -->
					{#if categories.length > 0}
						<DropdownMenu.Separator class="my-2 bg-gray-200" />
						<DropdownMenu.Group>
							<DropdownMenu.Label class="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
								{m.header_categories()}
							</DropdownMenu.Label>
							{#each categories as category}
								<DropdownMenu.Item
									onclick={() => navigateTo(`/${category.slug}`)}
									class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
								>
									<span class="text-lg">{category.icon || '📦'}</span>
									{category.name}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Group>
					{/if}
					
					<!-- Footer Actions -->
					<DropdownMenu.Separator class="my-2" />
					<div class="px-3 py-2 flex items-center justify-between">
						<span class="text-xs text-gray-500 font-medium">Language</span>
						<LanguageSwitcher />
					</div>
					
					{#if authContext?.user}
						<DropdownMenu.Separator class="my-2 bg-gray-200" />
						<DropdownMenu.Item
							onclick={handleSignOut}
							class="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer"
						>
							<LogOut class="h-4 w-4" />
							Sign out
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		
		<!-- Logo -->
		<a href="/" class="flex items-center space-x-2 mr-4 md:mr-6 md:ml-0 -ml-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded">
			<span class="text-xl md:text-2xl font-black tracking-tighter text-[oklch(13%_0_0)]">Driplo</span>
		</a>

		<!-- Desktop Search Bar -->
		<div class="flex-1 max-w-2xl mx-2 md:mx-4 hidden md:block">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
				<input
					type="search"
					placeholder={m.header_search_placeholder()}
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					class="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
				/>
			</div>
		</div>

		<!-- Desktop Actions -->
		<div class="hidden md:flex items-center space-x-2">
			<LanguageSwitcher />
			<a href="/wishlist" class="relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-100">
				<Heart class="h-5 w-5 text-gray-600" />
				<span class="sr-only">{m.header_favorites()}</span>
			</a>
			<a href="/orders" class="relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-100">
				<ShoppingBag class="h-5 w-5 text-gray-600" />
				<span class="sr-only">Orders</span>
			</a>
			<a href="/messages" class="relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-100">
				<MessageCircle class="h-5 w-5 text-gray-600" />
				{#if $unreadCount > 0}
					<span class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
						{$unreadCount > 99 ? '99+' : $unreadCount}
					</span>
				{/if}
				<span class="sr-only">{m.header_messages()}</span>
			</a>
			<a href={authContext?.user ? (authContext.profile?.username ? `/profile/${authContext.profile.username}` : '/profile') : '/login'} class="relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 hover:scale-105 transition-transform">
				{#if authContext?.user}
					{#if authContext.profile?.avatar_url}
						<img src={authContext.profile.avatar_url} alt="Profile" class="h-9 w-9 rounded-full border-2 border-gray-200 object-cover" />
					{:else}
						<div class="h-9 w-9 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
							<span class="text-white font-semibold text-sm">{(authContext.profile?.full_name || authContext.profile?.username || authContext.user.email)?.charAt(0).toUpperCase()}</span>
						</div>
					{/if}
				{:else}
					<div class="h-9 w-9 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
						<User class="h-5 w-5 text-gray-600" />
					</div>
				{/if}
				<span class="sr-only">{authContext?.user ? m.header_my_profile() : m.header_sign_in()}</span>
			</a>
		</div>

		<!-- Mobile Actions -->
		<div class="flex md:hidden items-center ml-auto">
			<a href={authContext?.user ? (authContext.profile?.username ? `/profile/${authContext.profile.username}` : '/profile') : '/login'} class="relative p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-100">
				{#if authContext?.user}
					{#if authContext.profile?.avatar_url}
						<img src={authContext.profile.avatar_url} alt="Profile" class="h-8 w-8 rounded-xl border-2 border-gray-200 object-cover" />
					{:else}
						<div class="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
							<span class="text-white font-semibold text-xs">{(authContext.profile?.full_name || authContext.profile?.username || authContext.user.email)?.charAt(0).toUpperCase()}</span>
						</div>
					{/if}
				{:else}
					<div class="h-8 w-8 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center">
						<User class="h-4 w-4 text-gray-600" />
					</div>
				{/if}
				<span class="sr-only">{authContext?.user ? m.header_my_profile() : m.header_sign_in()}</span>
			</a>
		</div>
	</div>

	<!-- Category Filter Chips (Desktop) -->
	<div class="hidden md:block border-t bg-white">
		<div class="container px-4 py-3">
			<div class="flex items-center space-x-2 overflow-x-auto">
				{#each quickCategories as category}
					<button
						onclick={() => selectCategory(category.value)}
						class={cn(
							"whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400",
							activeCategory === category.value
								? "bg-blue-500 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						)}
					>
						{category.name}
					</button>
				{/each}
			</div>
		</div>
	</div>
</header>