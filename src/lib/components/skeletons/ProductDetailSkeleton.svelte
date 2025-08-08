<script lang="ts">
	import { Skeleton } from '$lib/components/ui';
	import { cn } from '$lib/utils/cn';

	interface Props {
		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<div class={cn('max-w-6xl mx-auto px-4 py-6', className)}>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Image gallery skeleton -->
		<div class="space-y-4">
			<!-- Main image -->
			<Skeleton class="aspect-square w-full rounded-sm" />
			
			<!-- Thumbnail strip -->
			<div class="flex gap-2 overflow-x-auto">
				{#each Array(5) as _, i (i)}
					<Skeleton class="h-16 w-16 flex-shrink-0 rounded-sm" />
				{/each}
			</div>
		</div>

		<!-- Product info skeleton -->
		<div class="space-y-6">
			<!-- Header -->
			<div class="space-y-3">
				<Skeleton class="h-6 w-20" /> <!-- Brand -->
				<Skeleton class="h-8 w-3/4" /> <!-- Title -->
				<Skeleton class="h-7 w-24" /> <!-- Price -->
			</div>

			<!-- Product stats -->
			<div class="bg-gray-50 rounded-sm p-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-1">
							<Skeleton variant="circular" class="h-4 w-4" />
							<Skeleton class="h-4 w-16" />
						</div>
						<div class="flex items-center gap-1">
							<Skeleton variant="circular" class="h-4 w-4" />
							<Skeleton class="h-4 w-12" />
						</div>
					</div>
					<Skeleton class="h-4 w-20" />
				</div>
			</div>

			<!-- Action buttons -->
			<div class="space-y-3">
				<Skeleton class="h-11 w-full" /> <!-- Buy button -->
				<Skeleton class="h-11 w-full" /> <!-- Message button -->
			</div>

			<!-- Seller badge -->
			<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-sm">
				<Skeleton variant="circular" class="h-10 w-10" />
				<div class="flex-1 space-y-1">
					<div class="flex items-center gap-2">
						<Skeleton class="h-4 w-20" />
						<Skeleton variant="circular" class="h-4 w-4" />
					</div>
					<Skeleton class="h-3 w-16" />
					<Skeleton class="h-3 w-24" />
				</div>
			</div>

			<!-- Accordion sections -->
			<div class="space-y-2">
				{#each ['Product Details', 'Shipping & Returns', 'Seller'] as section}
					<div class="border border-gray-200 rounded-sm">
						<div class="flex items-center justify-between p-4">
							<Skeleton class="h-5 w-32" />
							<Skeleton variant="circular" class="h-4 w-4" />
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Related products skeleton -->
	<div class="mt-12">
		<Skeleton class="h-6 w-48 mb-6" />
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each Array(4) as _, i (i)}
				<div class="bg-white border border-gray-200 rounded-sm overflow-hidden">
					<Skeleton class="aspect-square w-full" />
					<div class="p-3 space-y-2">
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-5 w-16" />
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>