<script lang="ts">
	import { Heart, MessageCircle, User, Menu, ChevronDown, ShoppingBag } from 'lucide-svelte';
	import { Button, DropdownMenu } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { getAuthContext } from '$lib/stores/auth-context.svelte';
	import { unreadCount, initializeUnreadCount, subscribeToUnreadUpdates, unsubscribeFromUnreadUpdates } from '$lib/stores/messages';
	import type { Category } from '$lib/types';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import DriploLogo from '$lib/components/ui/DriploLogo.svelte';
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

<header class="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
	<!-- Main Header -->
	<div class="container flex h-14 md:h-16 items-center px-3 md:px-4">
		<!-- Logo -->
		<a href="/" class="flex items-center mr-auto focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-md px-1">
			<DriploLogo size="sm" className="md:hidden" />
			<DriploLogo size="md" className="hidden md:flex" />
		</a>
		
		<!-- Mobile Actions -->
		<div class="flex md:hidden items-center ml-auto gap-1">
			<!-- Mobile Messages -->
			{#if authContext?.user}
				<a 
					href="/messages" 
					class="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
					aria-label="Messages"
				>
					<MessageCircle class="h-5 w-5 text-gray-600" />
					{#if $unreadCount > 0}
						<span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
							{$unreadCount > 9 ? '9+' : $unreadCount}
						</span>
					{/if}
				</a>
			{/if}
			
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:ring-offset-1 transition-all duration-200 group hover:scale-105"
					aria-label="Account menu"
				>
					{#if authContext?.user}
						<img 
							src={authContext.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext.profile?.username || authContext.user.email}`} 
							alt="Profile" 
							class="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-[#87CEEB]/30" 
						/>
					{:else}
						<div class="h-9 w-9 rounded-full bg-white flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-[#87CEEB]/30">
							<User class="h-4 w-4 text-gray-600" />
						</div>
					{/if}
					<!-- Dropdown Indicator -->
					<div class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md border border-gray-100 group-hover:bg-[#87CEEB] group-hover:border-[#87CEEB] transition-all">
						<ChevronDown class="h-3 w-3 text-gray-600 group-hover:text-white transition-colors" />
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content 
					align="end" 
					sideOffset={8}
					class="w-64 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-2 shadow-2xl z-50"
				>
					{#if authContext?.user}
						<!-- Compact Profile Header -->
						<div class="px-2 py-2 mb-2">
							<button
								onclick={() => navigateTo(authContext.profile?.username ? `/profile/${authContext.profile.username}` : '/profile')}
								class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<img 
									src={authContext.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext.profile?.username || authContext.user.email}`} 
									alt="Profile" 
									class="h-12 w-12 rounded-xl object-cover" 
								/>
								<div class="flex-1 text-left">
									<p class="font-semibold text-gray-900">{authContext.profile?.full_name || authContext.profile?.username || 'My Profile'}</p>
									<p class="text-xs text-gray-500">@{authContext.profile?.username || 'user'}</p>
								</div>
							</button>
						</div>

						<!-- Quick Actions Grid -->
						<div class="grid grid-cols-2 gap-2 mb-3">
							<button
								onclick={() => navigateTo('/orders?type=bought')}
								class="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
							>
								<span class="text-lg">🛒</span>
								<span class="text-xs text-gray-700">Bought</span>
							</button>
							
							<button
								onclick={() => navigateTo('/orders?type=sold')}
								class="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
							>
								<span class="text-lg">💰</span>
								<span class="text-xs text-gray-700">Sold</span>
							</button>
						</div>

						<div class="border-t border-gray-100 pt-2 space-y-1">
							<!-- Admin Dashboard -->
							{#if authContext.profile?.is_admin}
								<button
									onclick={() => navigateTo('/admin')}
									class="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-colors text-left"
								>
									<span class="text-lg">👑</span>
									<span class="text-sm font-medium text-purple-700">Admin Dashboard</span>
								</button>
							{/if}
							
							<!-- Settings -->
							<button
								onclick={() => navigateTo('/profile/settings')}
								class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
							>
								<span class="text-lg">⚙️</span>
								<span class="text-sm text-gray-700">{m.header_settings()}</span>
							</button>
							
							<!-- Brand Profile & Analytics (for brand accounts) -->
							{#if authContext.profile?.account_type === 'brand'}
								{#await authContext.supabase
									.from('brand_profiles')
									.select('brand_slug')
									.eq('user_id', authContext.user.id)
									.single() then result}
									{#if result.data?.brand_slug}
										<button
											onclick={() => navigateTo(`/brands/${result.data.brand_slug}`)}
											class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
										>
											<span class="text-lg">🏪</span>
											<span class="text-sm text-gray-700">View Brand Profile</span>
										</button>
									{/if}
								{/await}
								<button
									onclick={() => navigateTo('/brands/analytics')}
									class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
								>
									<span class="text-lg">📊</span>
									<span class="text-sm text-gray-700">Brand Analytics</span>
								</button>
							{/if}
							
							<!-- Brand Settings -->
							<button
								onclick={() => navigateTo('/brands/settings')}
								class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
							>
								<span class="text-lg">🏪</span>
								<span class="text-sm text-gray-700">
									{authContext.profile?.account_type === 'brand' ? 'Brand Settings' : 'Upgrade to Brand'}
								</span>
								{#if authContext.profile?.is_verified}
									<span class="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
								{/if}
							</button>
							
							<!-- Language -->
							<div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
								<div class="flex items-center gap-3">
									<span class="text-lg">🌐</span>
									<span class="text-sm text-gray-700">Language</span>
								</div>
								<LanguageSwitcher />
							</div>
							
							<!-- Sign Out -->
							<button
								onclick={handleSignOut}
								class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
							>
								<span class="text-lg">🚪</span>
								<span class="text-sm font-medium">Sign out</span>
							</button>
						</div>
					{:else}
						<!-- Not logged in state -->
						<div class="p-4 text-center">
							<div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
								<User class="h-8 w-8 text-gray-400" />
							</div>
							<p class="text-sm text-gray-600 mb-4">Sign in to access your account</p>
							<button
								onclick={() => navigateTo('/login')}
								class="w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
							>
								{m.header_sign_in()}
							</button>
							<button
								onclick={() => navigateTo('/register')}
								class="w-full mt-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
							>
								Create account
							</button>
						</div>
						
						<!-- Language at bottom when not logged in -->
						<div class="border-t border-gray-100 pt-2 mt-4">
							<div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
								<div class="flex items-center gap-3">
									<span class="text-lg">🌐</span>
									<span class="text-sm text-gray-700">Language</span>
								</div>
								<LanguageSwitcher />
							</div>
						</div>
					{/if}
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
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:ring-offset-1 transition-all duration-200 group hover:scale-105"
					aria-label="Account menu"
				>
					{#if authContext?.user}
						<img 
							src={authContext.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext.profile?.username || authContext.user.email}`} 
							alt="Profile" 
							class="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-[#87CEEB]/30" 
						/>
					{:else}
						<div class="h-10 w-10 rounded-full bg-white flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-[#87CEEB]/30">
							<User class="h-5 w-5 text-gray-600" />
						</div>
					{/if}
					<!-- Dropdown Indicator -->
					<div class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md border border-gray-100 group-hover:bg-[#87CEEB] group-hover:border-[#87CEEB] transition-all">
						<ChevronDown class="h-3 w-3 text-gray-600 group-hover:text-white transition-colors" />
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content 
					align="end" 
					sideOffset={8}
					class="w-64 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-2 shadow-2xl z-50"
				>
					{#if authContext?.user}
						<!-- Compact Profile Header -->
						<div class="px-2 py-2 mb-2">
							<button
								onclick={() => navigateTo(authContext.profile?.username ? `/profile/${authContext.profile.username}` : '/profile')}
								class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<img 
									src={authContext.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext.profile?.username || authContext.user.email}`} 
									alt="Profile" 
									class="h-12 w-12 rounded-xl object-cover" 
								/>
								<div class="flex-1 text-left">
									<p class="font-semibold text-gray-900">{authContext.profile?.full_name || authContext.profile?.username || 'My Profile'}</p>
									<p class="text-xs text-gray-500">@{authContext.profile?.username || 'user'}</p>
								</div>
							</button>
						</div>

						<!-- Quick Actions Grid -->
						<div class="grid grid-cols-2 gap-2 mb-3">
							<button
								onclick={() => navigateTo('/orders?type=bought')}
								class="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
							>
								<span class="text-lg">🛒</span>
								<span class="text-xs text-gray-700">Bought</span>
							</button>
							
							<button
								onclick={() => navigateTo('/orders?type=sold')}
								class="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
							>
								<span class="text-lg">💰</span>
								<span class="text-xs text-gray-700">Sold</span>
							</button>
						</div>

						<div class="border-t border-gray-100 pt-2 space-y-1">
							<!-- Admin Dashboard -->
							{#if authContext.profile?.is_admin}
								<button
									onclick={() => navigateTo('/admin')}
									class="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-colors text-left"
								>
									<span class="text-lg">👑</span>
									<span class="text-sm font-medium text-purple-700">Admin Dashboard</span>
								</button>
							{/if}
							
							<!-- Settings -->
							<button
								onclick={() => navigateTo('/profile/settings')}
								class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
							>
								<span class="text-lg">⚙️</span>
								<span class="text-sm text-gray-700">{m.header_settings()}</span>
							</button>
							
							<!-- Brand Profile & Analytics (for brand accounts) -->
							{#if authContext.profile?.account_type === 'brand'}
								{#await authContext.supabase
									.from('brand_profiles')
									.select('brand_slug')
									.eq('user_id', authContext.user.id)
									.single() then result}
									{#if result.data?.brand_slug}
										<button
											onclick={() => navigateTo(`/brands/${result.data.brand_slug}`)}
											class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
										>
											<span class="text-lg">🏪</span>
											<span class="text-sm text-gray-700">View Brand Profile</span>
										</button>
									{/if}
								{/await}
								<button
									onclick={() => navigateTo('/brands/analytics')}
									class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
								>
									<span class="text-lg">📊</span>
									<span class="text-sm text-gray-700">Brand Analytics</span>
								</button>
							{/if}
							
							<!-- Brand Settings -->
							<button
								onclick={() => navigateTo('/brands/settings')}
								class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
							>
								<span class="text-lg">🏪</span>
								<span class="text-sm text-gray-700">
									{authContext.profile?.account_type === 'brand' ? 'Brand Settings' : 'Upgrade to Brand'}
								</span>
								{#if authContext.profile?.is_verified}
									<span class="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
								{/if}
							</button>
							
							<!-- Language -->
							<div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
								<div class="flex items-center gap-3">
									<span class="text-lg">🌐</span>
									<span class="text-sm text-gray-700">Language</span>
								</div>
								<LanguageSwitcher />
							</div>
							
							<!-- Sign Out -->
							<button
								onclick={handleSignOut}
								class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
							>
								<span class="text-lg">🚪</span>
								<span class="text-sm font-medium">Sign out</span>
							</button>
						</div>
					{:else}
						<!-- Not logged in state -->
						<div class="p-4 text-center">
							<div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
								<User class="h-8 w-8 text-gray-400" />
							</div>
							<p class="text-sm text-gray-600 mb-4">Sign in to access your account</p>
							<button
								onclick={() => navigateTo('/login')}
								class="w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
							>
								{m.header_sign_in()}
							</button>
							<button
								onclick={() => navigateTo('/register')}
								class="w-full mt-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
							>
								Create account
							</button>
						</div>
						
						<!-- Language at bottom when not logged in -->
						<div class="border-t border-gray-100 pt-2 mt-4">
							<div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
								<div class="flex items-center gap-3">
									<span class="text-lg">🌐</span>
									<span class="text-sm text-gray-700">Language</span>
								</div>
								<LanguageSwitcher />
							</div>
						</div>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
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