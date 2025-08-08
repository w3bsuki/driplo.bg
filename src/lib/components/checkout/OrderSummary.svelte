<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import * as m from '$lib/paraglide/messages.js';

	import type { Database } from '$lib/database.types';
	
	type Listing = Database['public']['Tables']['listings']['Row'];
	
	interface Props {
		listing: Listing;
		manualPaymentData?: Record<string, unknown>;
	}

	let { listing, manualPaymentData }: Props = $props();

	let totalAmount = $derived(listing ? listing.price + (listing.shipping_price || 0) : 0);
</script>

<div class="mb-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4">{m.checkout_order_summary()}</h3>
	<div class="bg-gray-50 rounded-xl p-4">
		<div class="flex gap-4">
			<img
				src={listing.images[0]}
				alt={listing.title}
				class="w-16 h-16 object-cover rounded-lg"
			/>
			<div class="flex-1">
				<h4 class="font-semibold text-gray-900">{listing.title}</h4>
				<p class="text-sm text-gray-600">Size: {listing.size || m.checkout_size_na()}</p>
				<p class="text-sm text-gray-600">Condition: {listing.condition}</p>
			</div>
		</div>
		
		<div class="mt-4 border-t border-gray-200 pt-4">
			<div class="flex justify-between text-sm">
				<span>{m.checkout_item_price()}</span>
				<span>{formatCurrency(listing.price)}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span>{m.checkout_shipping()}</span>
				<span>{listing.shipping_price > 0 ? formatCurrency(listing.shipping_price) : m.checkout_free_shipping()}</span>
			</div>
			{#if manualPaymentData?.buyer_fee}
				<div class="flex justify-between text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">
					<span>{m.checkout_buyer_protection_fee()}</span>
					<span>{formatCurrency(manualPaymentData.buyer_fee)}</span>
				</div>
			{/if}
			<div class="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-200">
				<span>{m.checkout_total()}</span>
				<span class="text-blue-400">{formatCurrency(manualPaymentData?.total_amount || totalAmount)}</span>
			</div>
		</div>
	</div>
</div>