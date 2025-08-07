<script lang="ts">
	import { Heart, ShoppingBag } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/currency';
	import { goto } from '$app/navigation';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';
	import { listingStore } from '$lib/stores/listing.svelte.ts';

	// Mix of context and props - context for listing data, props for specific UI behavior
	let { 
		listing = null,
		currentUser = null,
		onBuyNow = () => {},
		checkoutFlowRef,
		showStickyBar = true
	}: { 
		listing?: any, 
		currentUser?: any, 
		onBuyNow?: () => void, 
		checkoutFlowRef?: any, 
		showStickyBar?: boolean 
	} = $props();

	// Try to get context, fallback to props
	let context = $state.raw(() => {
		try {
			return getListingContext();
		} catch {
			// Context not available, use props and store directly
			return null;
		}
	});

	// Use context if available, otherwise use props and store
	const listingData = $derived(context ? context.listing : listing);
	const isOwner = $derived(() => context ? context.isOwner() : (currentUser?.id === listingData?.user_id));
	const isLiked = $derived(() => context ? context.isLiked() : listingStore.isLiked(listingData?.id || ''));
	const isLikeLoading = $derived(() => context ? context.isLikeLoading() : false);
	
	const toggleLike = () => {
		if (context) {
			context.toggleLike();
		} else if (listingData) {
			listingStore.toggleLike(listingData.id);
		}
	};

	// Computed states
	const canPurchase = $derived(!isOwner() && listingData?.status !== 'sold');
	const isSold = $derived(listingData?.status === 'sold');

	// Centralized button styling functions
	const getLikeButtonClass = (variant: 'default' | 'compact') => {
		const baseClasses = "transition-all duration-200 flex items-center justify-center gap-2 rounded-sm font-medium";
		const sizeClasses = variant === 'compact' ? "p-2.5" : "py-2.5 px-4";
		const layoutClasses = variant === 'compact' ? "" : "flex-1";
		const activeClasses = isLiked() 
			? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
			: "bg-gray-100 text-gray-600 hover:bg-gray-200";
		const scaleClasses = variant === 'compact' ? "transform active:scale-[0.98]" : "";
		const loadingClasses = isLikeLoading() ? "opacity-50 cursor-not-allowed" : "";
		
		return cn(baseClasses, sizeClasses, layoutClasses, activeClasses, scaleClasses, loadingClasses);
	};

	const getBuyButtonClass = (variant: 'default' | 'compact') => {
		const baseClasses = "bg-primary text-white rounded-sm font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2";
		const sizeClasses = variant === 'compact' ? "px-4 py-2" : "py-2.5 px-4";
		const layoutClasses = variant === 'compact' ? "" : "flex-1";
		const scaleClasses = variant === 'compact' ? "transform active:scale-[0.98]" : "";
		
		return cn(baseClasses, sizeClasses, layoutClasses, scaleClasses);
	};

	const getEditButtonClass = (variant: 'default' | 'compact') => {
		const baseClasses = "bg-primary text-white rounded-sm font-medium hover:bg-primary/90 transition-all duration-200 text-sm";
		const sizeClasses = variant === 'compact' ? "px-4 py-2" : "py-2.5 px-4";
		const layoutClasses = variant === 'compact' ? "" : "flex-1";
		const scaleClasses = variant === 'compact' ? "transform active:scale-[0.98]" : "";
		
		return cn(baseClasses, sizeClasses, layoutClasses, scaleClasses);
	};

	// Centralized event handlers
	const handleLike = () => toggleLike();
	const handleBuy = () => onBuyNow();
	const handleEdit = () => goto(`/listings/${listingData?.id}/edit`);
	const preloadCheckout = () => checkoutFlowRef?.preload();
</script>

<!-- Inline Action Buttons -->
{#if canPurchase}
	<div class="flex gap-2 mt-3">
		<button
			onclick={handleLike}
			disabled={isLikeLoading()}
			class={getLikeButtonClass('default')}
		>
			<Heart class={cn("w-4 h-4", isLiked() && "fill-current")} />
			<span class="text-sm">{isLiked() ? "Liked" : "Like"}</span>
		</button>
		<button
			onclick={handleBuy}
			onmouseenter={preloadCheckout}
			onfocus={preloadCheckout}
			class={getBuyButtonClass('default')}
		>
			<ShoppingBag class="w-4 h-4" />
			<span class="text-sm">Buy Now</span>
		</button>
	</div>
{:else if isOwner}
	<div class="flex gap-2 mt-3">
		<button
			onclick={handleEdit}
			class={getEditButtonClass('default')}
		>
			Edit Listing
		</button>
	</div>
{:else if isSold}
	<div class="mt-3">
		<div class="bg-red-50 border border-red-200 rounded-sm py-2.5 px-4 text-center">
			<span class="text-red-600 font-medium text-sm">This item has been sold</span>
		</div>
	</div>
{/if}

<!-- Sticky Bottom Bar -->
{#if showStickyBar}
	<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
		<div class="max-w-7xl mx-auto flex items-center gap-2">
			<!-- Price Info -->
			<div class="flex-1">
				<div class="text-base font-bold text-gray-900">{formatCurrency(listingData?.price || 0)}</div>
				<div class="text-xs text-gray-500">
					{listingData?.shipping_price > 0 ? `+ ${formatCurrency(listingData.shipping_price)} shipping` : 'Free shipping'}
				</div>
			</div>
			
			<!-- Compact Action Buttons -->
			{#if canPurchase}
				<button
					onclick={handleLike}
					disabled={isLikeLoading()}
					class={getLikeButtonClass('compact')}
				>
					<Heart class={cn("w-5 h-5", isLiked() && "fill-current")} />
				</button>
				<button
					onclick={handleBuy}
					onmouseenter={preloadCheckout}
					onfocus={preloadCheckout}
					class={getBuyButtonClass('compact')}
				>
					<ShoppingBag class="w-4 h-4" />
					<span class="text-sm">Buy Now</span>
				</button>
			{:else if isOwner}
				<button
					onclick={handleEdit}
					class={getEditButtonClass('compact')}
				>
					Edit Listing
				</button>
			{/if}
		</div>
	</div>
{/if}