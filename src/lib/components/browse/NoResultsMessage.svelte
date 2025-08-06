<script lang="ts">
	let {
		searchTerm = '',
		onClearFilters
	}: {
		searchTerm?: string;
		onClearFilters: () => void;
	} = $props();
</script>

<div class="bg-white rounded-sm border border-gray-200 p-8 text-center">
	<div class="max-w-md mx-auto">
		<div class="text-6xl mb-4">🔍</div>
		<h3 class="text-lg font-semibold text-gray-900 mb-2">
			No results found
		</h3>
		{#if searchTerm}
			<p class="text-gray-600 mb-4">
				We couldn't find any items matching "<span class="font-medium">{searchTerm}</span>". Try adjusting your search terms or filters.
			</p>
		{:else}
			<p class="text-gray-600 mb-4">
				We couldn't find any items matching your current filters. Try adjusting your search criteria.
			</p>
		{/if}
		
		<div class="space-y-2">
			<p class="text-sm text-gray-500 mb-4">Suggestions:</p>
			<ul class="text-sm text-gray-600 space-y-1 mb-6">
				<li>• Check your spelling</li>
				<li>• Try more general keywords</li>
				<li>• Remove some filters</li>
				<li>• Browse different categories</li>
			</ul>
			
			<button
				onclick={onClearFilters}
				class="px-4 py-2 bg-blue-500 text-white font-medium rounded-sm hover:bg-blue-600 transition-colors duration-100"
			>
				Clear All Filters
			</button>
		</div>
	</div>
</div>