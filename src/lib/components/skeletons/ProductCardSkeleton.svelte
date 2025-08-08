<script lang="ts">
	import { Skeleton } from '$lib/components/ui';
	import { cn } from '$lib/utils/cn';

	interface Props {
		/**
		 * Number of skeleton cards to show
		 */
		count?: number;
		
		/**
		 * Whether to show in grid layout
		 */
		grid?: boolean;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let { 
		count = 8,
		grid = true,
		class: className
	}: Props = $props();
</script>

<div 
	class={cn(
		grid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' : 'space-y-3',
		className
	)}
>
	{#each Array(count) as _, index (index)}
		<div class="bg-white rounded-sm border border-gray-200 overflow-hidden">
			<!-- Image skeleton -->
			<Skeleton class="aspect-square w-full" />
			
			<!-- Content skeleton -->
			<div class="p-3 space-y-2">
				<!-- Brand and title -->
				<div class="space-y-1">
					<Skeleton class="h-3 w-16" />
					<Skeleton class="h-4 w-3/4" />
				</div>
				
				<!-- Size and condition -->
				<div class="flex items-center gap-2">
					<Skeleton class="h-3 w-8" />
					<Skeleton class="h-3 w-12" />
				</div>
				
				<!-- Price and favorite -->
				<div class="flex items-center justify-between">
					<Skeleton class="h-5 w-16" />
					<Skeleton variant="circular" class="h-4 w-4" />
				</div>
				
				<!-- Seller info -->
				<div class="flex items-center gap-1">
					<Skeleton variant="circular" class="h-3 w-3" />
					<Skeleton class="h-3 w-20" />
				</div>
			</div>
		</div>
	{/each}
</div>