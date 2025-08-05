<script lang="ts">
	import { Skeleton } from '$lib/components/ui'
</script>

<div class="container max-w-6xl mx-auto px-4 py-6">
	<!-- Profile header skeleton -->
	<div class="bg-card rounded-lg p-6 mb-6">
		<div class="flex flex-col md:flex-row gap-6 items-start">
			<!-- Avatar -->
			<Skeleton variant="circular" class="h-24 w-24 md:h-32 md:w-32" />
			
			<!-- Profile info -->
			<div class="flex-1 space-y-3">
				<div class="flex items-center gap-3">
					<Skeleton class="h-8 w-48" />
					<Skeleton class="h-6 w-20 rounded-full" />
				</div>
				<Skeleton class="h-5 w-64" />
				<div class="flex gap-6">
					<div>
						<Skeleton class="h-6 w-16 mb-1" />
						<Skeleton class="h-4 w-20" />
					</div>
					<div>
						<Skeleton class="h-6 w-16 mb-1" />
						<Skeleton class="h-4 w-20" />
					</div>
					<div>
						<Skeleton class="h-6 w-16 mb-1" />
						<Skeleton class="h-4 w-20" />
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex gap-2">
				<Skeleton class="h-10 w-28" />
				<Skeleton class="h-10 w-10" />
			</div>
		</div>
	</div>

	<!-- Tabs skeleton -->
	<div class="border-b mb-6">
		<div class="flex gap-6">
			<Skeleton class="h-10 w-20" />
			<Skeleton class="h-10 w-24" />
			<Skeleton class="h-10 w-20" />
		</div>
	</div>

	<!-- Listings grid skeleton -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
		{#each Array(12) as _, i}
			<div>
				<Skeleton class="aspect-[3/4] w-full rounded-lg mb-2" />
				<div class="space-y-1">
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-5 w-16" />
				</div>
			</div>
		{/each}
	</div>
</div>