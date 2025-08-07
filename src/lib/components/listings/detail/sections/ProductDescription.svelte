<script lang="ts">
	import { cn } from '$lib/utils';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';

	const context = getListingContext();
	const { listing } = context;
	
	let isExpanded = $state(false);
	const shouldTruncate = $derived(listing?.description && listing.description.length > 200);
</script>

{#if listing?.description}
	<Card>
		<CardHeader class="pb-3">
			<CardTitle class="text-base">{m.product_description()}</CardTitle>
		</CardHeader>
		<CardContent>
			<p class={cn(
				"text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap",
				!isExpanded && shouldTruncate && "line-clamp-4"
			)}>
				{listing.description}
			</p>
			{#if shouldTruncate}
				<Button
					onclick={() => isExpanded = !isExpanded}
					variant="link"
					class="h-auto p-0 text-xs mt-2"
				>
					{isExpanded ? m.show_less() : m.show_more()}
				</Button>
			{/if}
		</CardContent>
	</Card>
{/if}