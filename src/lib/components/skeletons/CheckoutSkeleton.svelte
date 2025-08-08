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

<div class={cn('max-w-4xl mx-auto px-4 py-6', className)}>
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Checkout form -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Header -->
			<div class="space-y-2">
				<Skeleton class="h-8 w-32" />
				<Skeleton class="h-4 w-48" />
			</div>

			<!-- Shipping address section -->
			<div class="bg-white p-6 border border-gray-200 rounded-sm">
				<Skeleton class="h-6 w-40 mb-4" />
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<div class="sm:col-span-2">
						<Skeleton class="h-10 w-full" />
					</div>
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				</div>
			</div>

			<!-- Payment method section -->
			<div class="bg-white p-6 border border-gray-200 rounded-sm">
				<Skeleton class="h-6 w-36 mb-4" />
				<div class="space-y-4">
					<!-- Payment options -->
					<div class="flex gap-4">
						<div class="flex items-center gap-2">
							<Skeleton variant="circular" class="h-4 w-4" />
							<Skeleton class="h-4 w-16" />
						</div>
						<div class="flex items-center gap-2">
							<Skeleton variant="circular" class="h-4 w-4" />
							<Skeleton class="h-4 w-20" />
						</div>
					</div>
					
					<!-- Card form -->
					<div class="space-y-4">
						<Skeleton class="h-10 w-full" />
						<div class="grid grid-cols-2 gap-4">
							<Skeleton class="h-10 w-full" />
							<Skeleton class="h-10 w-full" />
						</div>
					</div>
				</div>
			</div>

			<!-- Submit button -->
			<Skeleton class="h-12 w-full" />
		</div>

		<!-- Order summary -->
		<div class="lg:col-span-1">
			<div class="bg-white p-6 border border-gray-200 rounded-sm sticky top-6">
				<Skeleton class="h-6 w-32 mb-4" />
				
				<!-- Order items -->
				<div class="space-y-4 mb-6">
					{#each Array(2) as _, i (i)}
						<div class="flex gap-4">
							<Skeleton class="h-16 w-16 rounded-sm" />
							<div class="flex-1 space-y-2">
								<Skeleton class="h-4 w-3/4" />
								<Skeleton class="h-3 w-1/2" />
								<div class="flex justify-between">
									<Skeleton class="h-4 w-12" />
									<Skeleton class="h-4 w-16" />
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Price breakdown -->
				<div class="space-y-2 py-4 border-t border-gray-200">
					<div class="flex justify-between">
						<Skeleton class="h-4 w-16" />
						<Skeleton class="h-4 w-12" />
					</div>
					<div class="flex justify-between">
						<Skeleton class="h-4 w-20" />
						<Skeleton class="h-4 w-10" />
					</div>
					<div class="flex justify-between">
						<Skeleton class="h-4 w-12" />
						<Skeleton class="h-4 w-10" />
					</div>
				</div>

				<!-- Total -->
				<div class="pt-4 border-t border-gray-200">
					<div class="flex justify-between items-center">
						<Skeleton class="h-5 w-16" />
						<Skeleton class="h-6 w-20" />
					</div>
				</div>

				<!-- Security badges -->
				<div class="mt-6 pt-4 border-t border-gray-200">
					<div class="flex items-center justify-center gap-2">
						<Skeleton variant="circular" class="h-4 w-4" />
						<Skeleton class="h-3 w-32" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>