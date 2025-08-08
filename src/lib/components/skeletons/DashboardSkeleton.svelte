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

<div class={cn('space-y-6', className)}>
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div class="space-y-1">
			<Skeleton class="h-8 w-48" />
			<Skeleton class="h-5 w-32" />
		</div>
		<Skeleton class="h-10 w-32" />
	</div>

	<!-- Stats cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each Array(4) as _, i (i)}
			<div class="bg-white p-4 border border-gray-200 rounded-sm">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<Skeleton class="h-4 w-20" />
						<Skeleton class="h-6 w-16" />
						<Skeleton class="h-3 w-24" />
					</div>
					<Skeleton variant="circular" class="h-8 w-8" />
				</div>
			</div>
		{/each}
	</div>

	<!-- Chart section -->
	<div class="bg-white p-6 border border-gray-200 rounded-sm">
		<div class="flex items-center justify-between mb-4">
			<Skeleton class="h-6 w-32" />
			<Skeleton class="h-8 w-24" />
		</div>
		<Skeleton class="h-64 w-full" />
	</div>

	<!-- Two column layout -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Recent activity -->
		<div class="bg-white p-6 border border-gray-200 rounded-sm">
			<Skeleton class="h-6 w-32 mb-4" />
			<div class="space-y-4">
				{#each Array(5) as _, i (i)}
					<div class="flex items-center gap-3">
						<Skeleton variant="circular" class="h-8 w-8" />
						<div class="flex-1 space-y-1">
							<Skeleton class="h-4 w-3/4" />
							<Skeleton class="h-3 w-1/2" />
						</div>
						<Skeleton class="h-3 w-12" />
					</div>
				{/each}
			</div>
		</div>

		<!-- Quick actions -->
		<div class="bg-white p-6 border border-gray-200 rounded-sm">
			<Skeleton class="h-6 w-24 mb-4" />
			<div class="grid grid-cols-1 gap-3">
				{#each Array(4) as _, i (i)}
					<div class="flex items-center gap-3 p-3 border border-gray-200 rounded-sm">
						<Skeleton variant="circular" class="h-6 w-6" />
						<div class="flex-1">
							<Skeleton class="h-4 w-24" />
						</div>
						<Skeleton class="h-6 w-6" />
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Data table -->
	<div class="bg-white border border-gray-200 rounded-sm">
		<div class="p-4 border-b border-gray-200">
			<div class="flex items-center justify-between">
				<Skeleton class="h-6 w-32" />
				<Skeleton class="h-8 w-24" />
			</div>
		</div>
		<div class="divide-y divide-gray-200">
			{#each Array(8) as _, i (i)}
				<div class="p-4">
					<div class="flex items-center gap-4">
						<Skeleton class="h-4 w-4" />
						<Skeleton variant="circular" class="h-8 w-8" />
						<div class="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
							<Skeleton class="h-4 w-24" />
							<Skeleton class="h-4 w-16" />
							<Skeleton class="h-4 w-20" />
							<Skeleton class="h-4 w-12" />
						</div>
						<Skeleton class="h-6 w-6" />
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>