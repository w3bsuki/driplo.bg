<script lang="ts">
	let {
		currentPage,
		totalCount,
		itemsPerPage,
		loadingMore = false,
		hasMore,
		onLoadMore
	}: {
		currentPage: number;
		totalCount: number;
		itemsPerPage: number;
		loadingMore?: boolean;
		hasMore: boolean;
		onLoadMore: () => void;
	} = $props();

	const totalPages = $derived(Math.ceil(totalCount / itemsPerPage));
	const currentItemsShown = $derived(Math.min(currentPage * itemsPerPage, totalCount));
</script>

{#if totalCount > 0}
	<div class="mt-6 space-y-4">
		<!-- Load More Button (for infinite scroll) -->
		{#if hasMore}
			<div class="text-center">
				<button
					onclick={onLoadMore}
					disabled={loadingMore}
					class="px-6 py-3 bg-blue-500 text-white font-medium rounded-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-100"
				>
					{#if loadingMore}
						<span class="flex items-center gap-2">
							<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
								<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Loading...
						</span>
					{:else}
						Load More Items
					{/if}
				</button>
			</div>
		{/if}

		<!-- Stats -->
		<div class="text-center text-sm text-gray-600">
			Showing <span class="font-medium">{currentItemsShown.toLocaleString()}</span>
			of <span class="font-medium">{totalCount.toLocaleString()}</span> results
			{#if totalPages > 1}
				• Page <span class="font-medium">{currentPage}</span> of <span class="font-medium">{totalPages}</span>
			{/if}
		</div>
	</div>
{/if}