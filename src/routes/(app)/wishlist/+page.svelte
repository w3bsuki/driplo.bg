<script lang="ts">
	import { Heart, ShoppingBag, Trash2, X, ChevronRight, Sparkles, TrendingUp } from 'lucide-svelte'
	import { Button } from '$lib/components/ui'
	import ListingCard from '$lib/components/listings/ListingCard.svelte'
	import type { PageData } from './$types'
	import { onMount } from 'svelte'
	import { formatDistanceToNow } from 'date-fns'

	let { data }: { data: PageData } = $props()

	let favorites = $state(data.favorites)
	let loading = $state(false)
	let showSkeletons = $state(false)
	let selectedItems = $state<Set<string>>(new Set())
	let bulkActionLoading = $state(false)

	// Show skeletons if no favorites for demo purposes
	onMount(() => {
		if (favorites.length === 0) {
			showSkeletons = true
		}
	})

	async function removeFavorite(listingId: string) {
		loading = true
		try {
			const response = await fetch('/api/wishlist', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ listing_id: listingId })
			})

			if (response.ok) {
				favorites = favorites.filter(fav => fav.listing_id !== listingId)
			}
		} catch (error) {
			console.error('Error removing favorite:', error)
		} finally {
			loading = false
		}
	}

	function toggleItem(itemId: string) {
		if (selectedItems.has(itemId)) {
			selectedItems.delete(itemId)
		} else {
			selectedItems.add(itemId)
		}
		selectedItems = new Set(selectedItems)
	}

	function toggleAllItems() {
		if (selectedItems.size === favorites.length) {
			selectedItems.clear()
		} else {
			selectedItems = new Set(favorites.map(f => f.listing_id))
		}
		selectedItems = new Set(selectedItems)
	}

	async function bulkRemove() {
		if (selectedItems.size === 0) return
		
		const confirmed = confirm(`Are you sure you want to remove ${selectedItems.size} items from your wishlist?`)
		if (!confirmed) return
		
		bulkActionLoading = true
		
		try {
			// Remove items one by one for now
			for (const itemId of selectedItems) {
				await removeFavorite(itemId)
			}
			selectedItems.clear()
			selectedItems = new Set()
		} catch (error) {
			console.error('Bulk remove failed:', error)
		} finally {
			bulkActionLoading = false
		}
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price)
	}
</script>

<svelte:head>
	<title>My Wishlist - Driplo</title>
	<meta name="description" content="View your favorite items and saved listings" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Simple Header -->
	<div class="bg-white border-b">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-semibold text-gray-900">My Wishlist</h1>
				<span class="text-sm text-gray-500">{favorites.length} items</span>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="container mx-auto px-4 py-8">
		{#if favorites.length === 0 && !showSkeletons}
			<!-- Empty state -->
			<div class="bg-white rounded-xl border border-gray-200 p-12 text-center">
				<div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
					<Heart class="w-8 h-8 text-gray-400" />
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
				<p class="text-sm text-gray-500 max-w-sm mx-auto mb-6">
					Start browsing and tap the heart icon on items you love to save them here for later.
				</p>
				<Button href="/browse" class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-300 rounded-lg hover:bg-blue-400 transition-colors">
					<ShoppingBag class="h-4 w-4" />
					Start Shopping
				</Button>
			</div>
		{:else}
			<!-- Bulk actions -->
			{#if favorites.length > 0}
				<div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						<div class="flex items-center gap-3">
							<input 
								type="checkbox" 
								class="w-5 h-5 sm:w-4 sm:h-4 text-blue-300 bg-gray-100 border-gray-300 rounded focus:ring-blue-300 focus:ring-2"
								checked={selectedItems.size === favorites.length && favorites.length > 0}
								onchange={toggleAllItems}
							/>
							<label class="text-sm font-medium text-gray-700 cursor-pointer select-none" onclick={toggleAllItems}>
								Select All
								{#if selectedItems.size > 0}
									<span class="text-gray-500 font-normal">({selectedItems.size} selected)</span>
								{/if}
							</label>
						</div>
						{#if selectedItems.size > 0}
							<div class="flex items-center gap-2 self-end sm:self-auto">
								<button 
									class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 min-h-[44px]"
									onclick={bulkRemove}
									disabled={bulkActionLoading}
								>
									<X class="w-4 h-4" />
									<span class="hidden sm:inline">{bulkActionLoading ? 'Removing...' : 'Remove Selected'}</span>
									<span class="sm:hidden">{bulkActionLoading ? '...' : 'Remove'}</span>
								</button>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Items List -->
			<div class="space-y-3">
				{#each favorites as favorite (favorite.id)}
					{@const listing = favorite.listings}
					{#if listing}
						<div class="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
							<div class="p-4">
								<!-- Mobile Layout -->
								<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<!-- Item Info Section -->
									<div class="flex items-start gap-3 sm:gap-4">
										<input 
											type="checkbox" 
											class="mt-1 w-5 h-5 sm:w-4 sm:h-4 text-blue-300 bg-gray-100 border-gray-300 rounded focus:ring-blue-300 focus:ring-2 flex-shrink-0"
											checked={selectedItems.has(listing.id)}
											onchange={() => toggleItem(listing.id)}
										/>
										
										<!-- Image and Details -->
										<div class="flex items-start gap-3 flex-1">
											{#if listing.images?.[0]}
												<img 
													src={listing.images[0]} 
													alt={listing.title}
													class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
												/>
											{:else}
												<div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
													<ShoppingBag class="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
												</div>
											{/if}
											
											<div class="flex-1 min-w-0">
												<h3 class="font-medium text-gray-900 line-clamp-1 sm:line-clamp-2 break-words">
													{listing.title}
												</h3>
												<p class="text-sm text-gray-500 mt-1 truncate">
													{listing.brand} • Size {listing.size}
												</p>
												<p class="text-xs text-gray-400 mt-1 truncate">
													Added {formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}
												</p>
												<!-- Mobile Price -->
												<span class="text-lg font-semibold text-gray-900 mt-2 block sm:hidden">
													{formatPrice(listing.price)}
												</span>
											</div>
										</div>
									</div>
									
									<!-- Desktop Price & Actions -->
									<div class="hidden sm:flex flex-col items-end gap-2">
										<span class="text-lg font-semibold text-gray-900">
											{formatPrice(listing.price)}
										</span>
										<div class="flex items-center gap-2">
											<button 
												onclick={() => removeFavorite(listing.id)}
												class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
												title="Remove from wishlist"
											>
												<Trash2 class="w-4 h-4" />
											</button>
											<a 
												href={`/listings/${listing.id}`} 
												class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap min-h-[44px]"
											>
												View Item
												<ChevronRight class="w-4 h-4" />
											</a>
										</div>
									</div>
								</div>
								
								<!-- Mobile Action Buttons -->
								<div class="flex gap-2 mt-3 sm:hidden">
									<button 
										onclick={() => removeFavorite(listing.id)}
										class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors min-h-[44px]"
										title="Remove from wishlist"
									>
										<Trash2 class="w-4 h-4 flex-shrink-0" />
										<span class="truncate">Remove</span>
									</button>
									<a 
										href={`/listings/${listing.id}`} 
										class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-white bg-blue-300 rounded-lg hover:bg-blue-400 transition-colors min-h-[44px]"
									>
										<ShoppingBag class="w-4 h-4 flex-shrink-0" />
										<span class="truncate">View</span>
									</a>
								</div>
								
								<!-- Seller info -->
								<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 mt-3 border-t border-gray-100">
									<div class="flex items-center gap-3 min-w-0">
										{#if listing.profiles}
											<img 
												src={listing.profiles.avatar_url || `https://ui-avatars.com/api/?name=${listing.profiles.username}&background=87CEEB&color=fff`}
												alt={listing.profiles.username}
												class="w-8 h-8 rounded-full flex-shrink-0"
											/>
											<div class="min-w-0">
												<p class="text-xs text-gray-500">Seller</p>
												<p class="text-sm font-medium text-gray-900 truncate">@{listing.profiles.username}</p>
											</div>
										{/if}
									</div>
									{#if listing.condition === 'new-with-tags'}
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 self-start sm:self-auto whitespace-nowrap">
											<Sparkles class="w-3 h-3 flex-shrink-0" />
											<span class="hidden sm:inline">New with tags</span>
											<span class="sm:hidden">New</span>
										</span>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>