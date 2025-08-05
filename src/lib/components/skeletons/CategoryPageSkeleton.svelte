<script lang="ts">
	import { Skeleton } from '$lib/components/ui'
</script>

<div class="container mx-auto px-4 py-6">
	<!-- Hero section skeleton -->
	<div class="mb-8 text-center">
		<Skeleton class="h-10 w-48 mx-auto mb-3" />
		<Skeleton class="h-5 w-64 mx-auto" />
	</div>

	<!-- Filter bar skeleton -->
	<div class="flex gap-4 mb-6 overflow-x-auto pb-2">
		{#each Array(5) as _, i}
			<Skeleton class="h-9 w-24 flex-shrink-0 rounded-full" />
		{/each}
	</div>

	<!-- Products grid skeleton -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
		{#each Array(15) as _, i}
			<div class="group">
				<Skeleton class="aspect-[3/4] w-full rounded-lg mb-2" />
				<div class="space-y-1.5">
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-3 w-1/2" />
					<Skeleton class="h-5 w-16" />
				</div>
			</div>
		{/each}
	</div>

	<!-- Load more skeleton -->
	<div class="mt-8 text-center">
		<Skeleton class="h-10 w-32 mx-auto rounded-full" />
	</div>
</div>