<script lang="ts">
	import ProductCard from '$lib/components/listings/ProductCard.svelte';

	let { relatedListings = [] } = $props();
</script>

{#if relatedListings && relatedListings.length > 0}
	<div class="mt-8">
		<h3 class="text-lg font-semibold mb-4">Similar Items</h3>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
			{#each relatedListings as relatedListing (relatedListing.id)}
				<ProductCard {...relatedListing} />
			{/each}
		</div>
	</div>
{/if}