<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Bell, Check, CheckCheck, Heart, MessageSquare, UserPlus, Package } from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { cn } from '$lib/utils';
	import { realtimeNotifications } from '$lib/stores/realtime-notifications.svelte';
	import { goto } from '$app/navigation';

	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement;

	// Close dropdown when clicking outside
	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
				isOpen = false;
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});

	onDestroy(() => {
		realtimeNotifications.disconnect();
	});

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function getNotificationIcon(type: string) {
		switch (type) {
			case 'follow':
				return UserPlus;
			case 'message':
				return MessageSquare;
			case 'listing_liked':
				return Heart;
			case 'order_update':
				return Package;
			default:
				return Bell;
		}
	}

	function handleNotificationClick(notification: any) {
		// Mark as read
		if (!notification.is_read) {
			realtimeNotifications.markAsRead(notification.id);
		}

		// Navigate based on notification type
		switch (notification.type) {
			case 'follow':
				if (notification.data?.follower_id) {
					// Would need to get username from profile
					goto('/profile'); // Fallback to profile page
				}
				break;
			case 'message':
				if (notification.data?.conversation_id) {
					goto(`/messages/${notification.data.conversation_id}`);
				} else {
					goto('/messages');
				}
				break;
			case 'listing_liked':
				if (notification.data?.listing_id) {
					goto(`/listings/${notification.data.listing_id}`);
				}
				break;
			case 'order_update':
				goto('/orders');
				break;
		}

		isOpen = false;
	}

	function markAllAsRead() {
		realtimeNotifications.markAllAsRead();
	}

	const notifications = $derived(realtimeNotifications.notifications);
	const unreadCount = $derived(realtimeNotifications.unreadCount);
	const isConnected = $derived(realtimeNotifications.isConnected);
</script>

<div class="relative" bind:this={dropdownRef}>
	<!-- Notification Bell Button -->
	<button
		onclick={toggleDropdown}
		class={cn(
			"relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors",
			isOpen && "bg-gray-100 text-gray-900"
		)}
		aria-label="Notifications"
	>
		<Bell class="h-5 w-5" />
		
		{#if unreadCount > 0}
			<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
				{unreadCount > 99 ? '99+' : unreadCount}
			</span>
		{/if}

		<!-- Connection indicator -->
		{#if !isConnected && notifications.length > 0}
			<span class="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full h-2 w-2" 
				title="Reconnecting..."></span>
		{/if}
	</button>

	<!-- Dropdown -->
	{#if isOpen}
		<div class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
			<!-- Header -->
			<div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
				<div class="flex items-center gap-2">
					{#if unreadCount > 0}
						<button
							onclick={markAllAsRead}
							class="text-xs text-blue-600 hover:text-blue-800 font-medium"
						>
							Mark all read
						</button>
					{/if}
					{#if !isConnected}
						<div class="flex items-center gap-1 text-xs text-yellow-600">
							<div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
							Reconnecting...
						</div>
					{/if}
				</div>
			</div>

			<!-- Notifications List -->
			<div class="max-h-96 overflow-y-auto">
				{#if notifications.length === 0}
					<div class="px-4 py-8 text-center text-gray-500">
						<Bell class="h-8 w-8 mx-auto mb-2 text-gray-300" />
						<p class="text-sm">No notifications yet</p>
						<p class="text-xs text-gray-400">You'll see activity updates here</p>
					</div>
				{:else}
					{#each notifications as notification}
						{@const Icon = getNotificationIcon(notification.type)}
						<button
							onclick={() => handleNotificationClick(notification)}
							class={cn(
								"w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
								!notification.is_read && "bg-blue-50"
							)}
						>
							<div class="flex items-start space-x-3">
								<div class={cn(
									"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
									notification.type === 'follow' && "bg-blue-100 text-blue-600",
									notification.type === 'message' && "bg-green-100 text-green-600",
									notification.type === 'listing_liked' && "bg-red-100 text-red-600",
									notification.type === 'order_update' && "bg-purple-100 text-purple-600",
									notification.type === 'system' && "bg-gray-100 text-gray-600"
								)}>
									<Icon class="h-4 w-4" />
								</div>
								
								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<p class="text-sm font-medium text-gray-900">
												{notification.title}
											</p>
											<p class="text-sm text-gray-600 mt-0.5 line-clamp-2">
												{notification.message}
											</p>
										</div>
										
										<div class="flex items-center gap-2 ml-2">
											<span class="text-xs text-gray-500">
												{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
											</span>
											{#if notification.is_read}
												<CheckCheck class="h-3 w-3 text-gray-400" />
											{:else}
												<div class="w-2 h-2 bg-blue-500 rounded-full"></div>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<!-- Footer -->
			{#if notifications.length > 0}
				<div class="px-4 py-3 border-t border-gray-200 text-center">
					<button
						onclick={() => { goto('/notifications'); isOpen = false; }}
						class="text-sm text-blue-600 hover:text-blue-800 font-medium"
					>
						View all notifications
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>