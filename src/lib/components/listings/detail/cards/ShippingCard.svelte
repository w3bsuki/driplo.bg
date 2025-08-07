<script lang="ts">
	import { Truck, MapPin, RotateCcw } from 'lucide-svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { formatCurrency } from '$lib/utils/currency';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte.ts';

	const context = getListingContext();
	const { listing } = context;
</script>

<Card>
	<CardHeader class="pb-3">
		<CardTitle class="text-base flex items-center gap-2">
			<Truck class="h-4 w-4" />
			{m.shipping_info()}
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-3">
		<div class="flex items-center gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
				<Truck class="h-4 w-4 text-muted-foreground" />
			</div>
			<div class="flex-1">
				<p class="text-sm font-medium">
					{listing?.shipping_price > 0 
						? formatCurrency(listing.shipping_price)
						: m.free_shipping()}
				</p>
				<p class="text-xs text-muted-foreground">{m.shipping_cost()}</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
				<MapPin class="h-4 w-4 text-muted-foreground" />
			</div>
			<div class="flex-1">
				<p class="text-sm font-medium">
					{listing?.seller?.city || 'Bulgaria'}
				</p>
				<p class="text-xs text-muted-foreground">{m.ships_from()}</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
				<RotateCcw class="h-4 w-4 text-muted-foreground" />
			</div>
			<div class="flex-1">
				<p class="text-sm font-medium">14 days</p>
				<p class="text-xs text-muted-foreground">
					{m.returns_accepted({ days: 14 })}
				</p>
			</div>
		</div>
	</CardContent>
</Card>