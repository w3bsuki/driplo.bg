<script lang="ts">
	import { cn } from '$lib/utils';
	import Button from '$lib/components/ui/button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte';

	const context = getListingContext();
	const { listing } = context;
	
	let isDescriptionExpanded = $state(false);
	const shouldTruncateDescription = $derived(listing?.description && listing.description.length > 200);

	interface Spec {
		label: string;
		value: string | undefined;
	}

	const specs = $derived<Spec[]>([
		{ label: m.product_color(), value: listing?.color },
		{ label: m.product_material(), value: listing?.material },
		{ label: m.product_pattern(), value: listing?.pattern },
		{ label: m.product_style(), value: listing?.style }
	].filter(spec => spec.value));
</script>

<div class="space-y-6">
	<!-- Product Description -->
	{#if listing?.description}
		<div>
			<h4 class="text-sm font-medium text-foreground mb-3">{m.product_description()}</h4>
			<p class={cn(
				"text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap",
				!isDescriptionExpanded && shouldTruncateDescription && "line-clamp-4"
			)}>
				{listing.description}
			</p>
			{#if shouldTruncateDescription}
				<Button
					onclick={() => isDescriptionExpanded = !isDescriptionExpanded}
					variant="link"
					class="h-auto p-0 text-xs mt-2 text-primary"
				>
					{isDescriptionExpanded ? m.show_less() : m.show_more()}
				</Button>
			{/if}
		</div>
	{/if}

	<!-- Product Specifications -->
	{#if specs.length > 0}
		<div>
			<h4 class="text-sm font-medium text-foreground mb-3">Specifications</h4>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each specs as spec}
					<div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
						<span class="text-sm text-muted-foreground">{spec.label}</span>
						<span class="text-sm font-medium text-foreground">{spec.value}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>