<script lang="ts">
	let {
		itemCount = 8
	}: {
		itemCount?: number;
	} = $props();
</script>

<div class="bg-white rounded-sm border border-gray-200 p-3 mb-3">
	<div class="flex items-center justify-between">
		<div class="space-y-2">
			<div class="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
			<div class="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
		</div>
		<div class="flex items-center gap-2">
			<div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
			<div class="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
		</div>
	</div>
</div>

<!-- Product Grid Skeleton -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
	{#each Array(itemCount) as _, index (index)}
		<div class="bg-white rounded-sm border border-gray-200 overflow-hidden animate-pulse">
			<!-- Image skeleton -->
			<div class="aspect-square bg-gray-200"></div>
			
			<!-- Content skeleton -->
			<div class="p-3 space-y-2">
				<div class="h-4 bg-gray-200 rounded w-3/4"></div>
				<div class="h-3 bg-gray-200 rounded w-1/2"></div>
				<div class="flex items-center justify-between">
					<div class="h-5 bg-gray-200 rounded w-16"></div>
					<div class="h-4 bg-gray-200 rounded w-4"></div>
				</div>
				<div class="flex items-center gap-1">
					<div class="h-3 bg-gray-200 rounded w-12"></div>
					<div class="h-3 bg-gray-200 rounded w-8"></div>
				</div>
			</div>
		</div>
	{/each}
</div>

<!-- Loading text -->
<div class="mt-4 text-center text-sm text-gray-500">
	Loading products...
</div>