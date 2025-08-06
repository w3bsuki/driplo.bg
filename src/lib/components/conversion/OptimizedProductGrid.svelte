<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { cn } from '$lib/utils';
	import ConversionOptimizedListingCard from './ConversionOptimizedListingCard.svelte';
	import { Loader2, Grid3X3, List } from 'lucide-svelte';
	
	interface Product {
		id: string;
		title: string;
		price: number;
		originalPrice?: number;
		brand?: string;
		image: string | string[];
		seller: {
			username: string;
			avatar?: string;
			account_type?: string;
			is_verified?: boolean;
			rating?: number;
		};
		likes?: number;
		views?: number;
		isLiked?: boolean;
		condition?: string;
		size?: string;
		isUrgent?: boolean;
		isTrending?: boolean;
		soldRecently?: boolean;
	}
	
	interface Props {
		products: Product[];
		loading?: boolean;
		hasMore?: boolean;
		onLoadMore?: () => void;
		gridSize?: 2 | 3 | 4;
		className?: string;
	}
	
	let { 
		products, 
		loading = false, 
		hasMore = true, 
		onLoadMore,
		gridSize = 4,
		className 
	}: Props = $props();
	
	// ✅ CORRECT: Use $state() for component state
	let gridContainer: HTMLElement;
	let isIntersecting = $state(false);
	let viewMode = $state<'grid' | 'list'>('grid');
	let observer: IntersectionObserver;
	
	// ✅ CORRECT: Use $derived() for computed values
	const gridClass = $derived(() => {
		const classes = {
			2: 'grid-cols-2',
			3: 'grid-cols-2 md:grid-cols-3',
			4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
		};
		return classes[gridSize];
	});
	
	const visibleProducts = $derived(() => {
		// Add conversion psychology: show urgent/trending items first
		return products.sort((a, b) => {
			if (a.isUrgent && !b.isUrgent) return -1;
			if (b.isUrgent && !a.isUrgent) return 1;
			if (a.isTrending && !b.isTrending) return -1;
			if (b.isTrending && !a.isTrending) return 1;
			return 0;
		});
	});
	
	// ✅ CORRECT: Use $effect() for side effects
	$effect(() => {
		if (isIntersecting && hasMore && !loading && onLoadMore) {
			onLoadMore();
		}
	});
	
	onMount(() => {
		// Intersection observer for infinite scrolling
		observer = new IntersectionObserver(
			([entry]) => {
				isIntersecting = entry.isIntersecting;
			},
			{
				threshold: 0.1,
				rootMargin: '100px' // Start loading 100px before reaching the end
			}
		);
		
		// Performance optimization: observe load more trigger
		const loadMoreTrigger = document.querySelector('[data-load-more]');
		if (loadMoreTrigger) {
			observer.observe(loadMoreTrigger);
		}
	});
	
	onDestroy(() => {
		observer?.disconnect();
	});
	
	function handleViewModeToggle() {
		viewMode = viewMode === 'grid' ? 'list' : 'grid';
	}
</script>

<div class={cn("space-y-4", className)}>
	<!-- Grid Controls -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="text-sm text-gray-600 font-medium">
				{products.length} {products.length === 1 ? 'item' : 'items'}
			</span>
			{#if loading}
				<Loader2 class="h-4 w-4 animate-spin text-gray-400" />
			{/if}
		</div>
		
		<div class="flex items-center gap-2">
			<!-- View Mode Toggle -->
			<button
				onclick={handleViewModeToggle}
				class="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
				aria-label="Toggle view mode"
			>
				{#if viewMode === 'grid'}
					<List class="h-4 w-4 text-gray-600" />
				{:else}
					<Grid3X3 class="h-4 w-4 text-gray-600" />
				{/if}
			</button>
		</div>
	</div>
	
	<!-- Product Grid -->
	{#if viewMode === 'grid'}
		<div 
			bind:this={gridContainer}
			class={cn(
				"grid gap-4 md:gap-6",
				gridClass
			)}
		>
			{#each visibleProducts as product, index}
				<ConversionOptimizedListingCard
					{...product}
					eagerLoading={index < 8}
					class="animate-fade-in"
					style="animation-delay: {index * 50}ms"
				/>
			{/each}
		</div>
	{:else}
		<!-- List View for Dense Information -->
		<div class="space-y-3">
			{#each visibleProducts as product, index}
				<div class="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
					<!-- Image -->
					<div class="w-20 h-20 flex-shrink-0">
						<img 
							src={Array.isArray(product.image) ? product.image[0] : product.image}
							alt={product.title}
							class="w-full h-full object-cover rounded-md"
							loading={index < 5 ? 'eager' : 'lazy'}
						/>
					</div>
					
					<!-- Content -->
					<div class="flex-1 min-w-0">
						<div class="flex items-start justify-between">
							<div>
								<h3 class="font-semibold text-gray-900 text-sm truncate">{product.title}</h3>
								{#if product.brand}
									<p class="text-xs text-gray-600">{product.brand}</p>
								{/if}
								<div class="flex items-center gap-2 mt-2">
									<span class="text-sm text-gray-700">{product.seller.username}</span>
									{#if product.seller.is_verified}
										<span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>
									{/if}
								</div>
							</div>
							<div class="text-right">
								<p class="font-bold text-gray-900">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(product.price)}</p>
								{#if product.size}
									<p class="text-xs text-gray-600 mt-1">Size {product.size}</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	
	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-8">
			<div class="flex items-center gap-3">
				<Loader2 class="h-5 w-5 animate-spin text-blue-500" />
				<span class="text-sm text-gray-600 font-medium">Loading more items...</span>
			</div>
		</div>
	{/if}
	
	<!-- Load More Trigger -->
	{#if hasMore && !loading}
		<div data-load-more class="h-10 flex items-center justify-center">
			<div class="w-2 h-2 bg-transparent rounded-full"></div>
		</div>
	{/if}
	
	<!-- End of Results -->
	{#if !hasMore && products.length > 0}
		<div class="text-center py-8 text-gray-500">
			<p class="font-medium">That's everything!</p>
			<p class="text-sm mt-1">You've seen all {products.length} items</p>
		</div>
	{/if}
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-fade-in {
		animation: fade-in 0.5s ease-out forwards;
		opacity: 0;
	}
</style>