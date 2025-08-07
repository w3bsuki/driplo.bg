<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';

	const context = getListingContext();
	const { listing } = context;

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

{#if specs.length > 0}
	<Card>
		<CardContent class="p-4">
			<div class="grid grid-cols-2 gap-3">
				{#each specs as spec}
					<div class="text-sm">
						<span class="text-muted-foreground">{spec.label}:</span>
						<span class="ml-2 text-foreground font-medium">{spec.value}</span>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
{/if}