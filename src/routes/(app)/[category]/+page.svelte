<script lang="ts">
	import type { PageData } from './$types';
	import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
	import { Button } from '$lib/components/ui';
	import { ChevronLeft, Filter } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	
	let { data }: { data: PageData } = $props();
	
	// Subcategory collections with emojis
	const subcategories = {
		men: [
			{ name: 'T-Shirts', emoji: '👕', filter: 't-shirts' },
			{ name: 'Shirts', emoji: '👔', filter: 'shirts' },
			{ name: 'Jeans', emoji: '👖', filter: 'jeans' },
			{ name: 'Jackets', emoji: '🧥', filter: 'jackets' },
			{ name: 'Hoodies', emoji: '🧤', filter: 'hoodies' },
			{ name: 'Shorts', emoji: '🩳', filter: 'shorts' },
			{ name: 'Suits', emoji: '🤵', filter: 'suits' },
			{ name: 'Shoes', emoji: '👟', filter: 'shoes' },
		],
		women: [
			{ name: 'Dresses', emoji: '👗', filter: 'dresses' },
			{ name: 'Tops', emoji: '👚', filter: 'tops' },
			{ name: 'Jeans', emoji: '👖', filter: 'jeans' },
			{ name: 'Skirts', emoji: '👘', filter: 'skirts' },
			{ name: 'Jackets', emoji: '🧥', filter: 'jackets' },
			{ name: 'Bags', emoji: '👜', filter: 'bags' },
			{ name: 'Heels', emoji: '👠', filter: 'heels' },
			{ name: 'Jewelry', emoji: '💍', filter: 'jewelry' },
		],
		shoes: [
			{ name: 'Sneakers', emoji: '👟', filter: 'sneakers' },
			{ name: 'Boots', emoji: '🥾', filter: 'boots' },
			{ name: 'Heels', emoji: '👠', filter: 'heels' },
			{ name: 'Sandals', emoji: '👡', filter: 'sandals' },
			{ name: 'Loafers', emoji: '👞', filter: 'loafers' },
			{ name: 'Athletic', emoji: '⚡', filter: 'athletic' },
		],
		bags: [
			{ name: 'Handbags', emoji: '👜', filter: 'handbags' },
			{ name: 'Backpacks', emoji: '🎒', filter: 'backpacks' },
			{ name: 'Totes', emoji: '👜', filter: 'totes' },
			{ name: 'Clutches', emoji: '💼', filter: 'clutches' },
			{ name: 'Crossbody', emoji: '👝', filter: 'crossbody' },
			{ name: 'Wallets', emoji: '💳', filter: 'wallets' },
		],
		accessories: [
			{ name: 'Jewelry', emoji: '💍', filter: 'jewelry' },
			{ name: 'Watches', emoji: '⌚', filter: 'watches' },
			{ name: 'Sunglasses', emoji: '🕶️', filter: 'sunglasses' },
			{ name: 'Hats', emoji: '🎩', filter: 'hats' },
			{ name: 'Belts', emoji: '🎀', filter: 'belts' },
			{ name: 'Scarves', emoji: '🧣', filter: 'scarves' },
		]
	};
	
	function handleSubcategoryClick(subcategory: string) {
		goto(`/browse?category=${data.category}&subcategory=${subcategory}`);
	}
	
	function handleSortChange(sort: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('sort', sort);
		goto(url.pathname + url.search);
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white border-b sticky top-0 z-10">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<button 
						onclick={() => window.history.back()}
						class="p-2 hover:bg-gray-100 rounded-full transition-colors"
					>
						<ChevronLeft class="w-5 h-5" />
					</button>
					<div>
						<h1 class="text-2xl font-bold flex items-center gap-2">
							<span class="text-3xl">{data.categoryInfo.emoji}</span>
							{data.categoryInfo.title}
						</h1>
						<p class="text-sm text-gray-600">{data.categoryInfo.description}</p>
					</div>
				</div>
				<Button variant="outline" size="sm">
					<Filter class="w-4 h-4 mr-2" />
					Filters
				</Button>
			</div>
		</div>
	</div>
	
	<!-- Subcategory Pills -->
	{#if subcategories[data.category]}
		<div class="bg-white border-b">
			<div class="container mx-auto px-4 py-3">
				<div class="flex gap-2 overflow-x-auto scrollbar-hide">
					{#each subcategories[data.category] as sub}
						<button
							onclick={() => handleSubcategoryClick(sub.filter)}
							class="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 whitespace-nowrap transition-colors"
						>
							<span class="text-lg">{sub.emoji}</span>
							<span class="text-sm font-medium">{sub.name}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Sort Bar -->
	<div class="bg-white border-b">
		<div class="container mx-auto px-4 py-2">
			<div class="flex items-center justify-between">
				<p class="text-sm text-gray-600">
					{data.pagination.totalItems} items found
				</p>
				<select 
					onchange={(e) => handleSortChange(e.currentTarget.value)}
					class="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
				>
					<option value="created_at">Newest</option>
					<option value="price_asc">Price: Low to High</option>
					<option value="price_desc">Price: High to Low</option>
					<option value="popular">Most Popular</option>
				</select>
			</div>
		</div>
	</div>
	
	<!-- Listings Grid -->
	<div class="container mx-auto px-4 py-6">
		{#if data.listings.length > 0}
			<ListingGrid listings={data.listings} />
			
			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="mt-8 flex justify-center gap-2">
					{#each Array(data.pagination.totalPages) as _, i}
						<button
							onclick={() => goto(`/${data.category}?page=${i + 1}`)}
							class="px-3 py-1 rounded-md {data.pagination.currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}"
						>
							{i + 1}
						</button>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="text-center py-12">
				<p class="text-gray-500 text-lg">No items found in this category</p>
				<Button onclick={() => goto('/browse')} class="mt-4">
					Browse All Items
				</Button>
			</div>
		{/if}
	</div>
</div>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>