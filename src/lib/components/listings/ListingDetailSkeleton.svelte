<script lang="ts">
	import { Skeleton } from '$lib/components/ui'
</script>

<div class="container max-w-7xl mx-auto px-4 py-6">
	<!-- Breadcrumb skeleton -->
	<div class="flex items-center gap-2 mb-4">
		<Skeleton class="h-4 w-16" />
		<span class="text-muted-foreground">/</span>
		<Skeleton class="h-4 w-20" />
		<span class="text-muted-foreground">/</span>
		<Skeleton class="h-4 w-32" />
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Image Gallery Skeleton -->
		<div class="lg:col-span-7">
			<!-- Main image -->
			<Skeleton class="aspect-[4/5] w-full rounded-lg mb-4" />
			
			<!-- Thumbnail row -->
			<div class="flex gap-2 overflow-x-auto">
				{#each Array(5) as _, i}
					<Skeleton class="w-20 h-20 flex-shrink-0 rounded" />
				{/each}
			</div>
		</div>

		<!-- Product Info Skeleton -->
		<div class="lg:col-span-5 space-y-6">
			<!-- Title and price -->
			<div>
				<Skeleton class="h-8 w-3/4 mb-3" />
				<Skeleton class="h-10 w-32" />
			</div>

			<!-- Size and condition badges -->
			<div class="flex gap-2">
				<Skeleton class="h-8 w-16 rounded-full" />
				<Skeleton class="h-8 w-24 rounded-full" />
				<Skeleton class="h-8 w-20 rounded-full" />
			</div>

			<!-- Action buttons -->
			<div class="flex gap-3">
				<Skeleton class="h-12 flex-1" />
				<Skeleton class="h-12 w-12" />
				<Skeleton class="h-12 w-12" />
			</div>

			<!-- Seller info card -->
			<div class="border rounded-lg p-4">
				<div class="flex items-center gap-3 mb-3">
					<Skeleton variant="circular" class="h-12 w-12" />
					<div class="flex-1">
						<Skeleton class="h-5 w-32 mb-1" />
						<Skeleton class="h-4 w-24" />
					</div>
				</div>
				<div class="flex gap-2">
					<Skeleton class="h-9 flex-1" />
					<Skeleton class="h-9 flex-1" />
				</div>
			</div>

			<!-- Product details tabs -->
			<div class="border-t pt-4">
				<div class="flex gap-4 mb-4">
					<Skeleton class="h-6 w-20" />
					<Skeleton class="h-6 w-16" />
					<Skeleton class="h-6 w-24" />
				</div>
				<div class="space-y-2">
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-5/6" />
					<Skeleton class="h-4 w-4/6" />
				</div>
			</div>
		</div>
	</div>

	<!-- Related products skeleton -->
	<div class="mt-12">
		<Skeleton class="h-6 w-48 mb-4" />
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each Array(4) as _, i}
				<div>
					<Skeleton class="aspect-[3/4] w-full rounded-t-lg" />
					<div class="p-3 bg-card rounded-b-lg">
						<Skeleton class="h-4 w-3/4 mb-2" />
						<Skeleton class="h-5 w-16" />
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>