<script lang="ts">
	import { Truck } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { formatCurrency } from '$lib/utils/currency';

	interface ShippingAddress {
		name: string;
		address_line1: string;
		address_line2: string;
		city: string;
		state: string;
		postal_code: string;
		country: string;
	}

	import type { Database } from '$lib/database.types';
	
	type Listing = Database['public']['Tables']['listings']['Row'];
	
	interface Props {
		listing: Listing;
		shippingAddress: ShippingAddress;
		itemPrice: number;
		shippingCost: number;
		buyerFee: number;
		totalAmount: number;
		onShippingAddressChange: (field: keyof ShippingAddress, value: string) => void;
	}

	let { 
		listing, 
		shippingAddress, 
		itemPrice, 
		shippingCost, 
		buyerFee, 
		totalAmount,
		onShippingAddressChange 
	}: Props = $props();
</script>

<!-- Step 1: Order Summary & Shipping -->
<div class="p-6" transition:slide>
	<!-- Product Details -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
		<div class="bg-gray-50 rounded-xl p-4">
			<div class="flex gap-4">
				<img
					src={listing.images[0]}
					alt={listing.title}
					class="w-20 h-20 object-cover rounded-lg"
				/>
				<div class="flex-1">
					<h4 class="font-semibold text-gray-900">{listing.title}</h4>
					<p class="text-sm text-gray-600 mt-1">Size: {listing.size || 'N/A'}</p>
					<p class="text-sm text-gray-600">Condition: {listing.condition}</p>
					<p class="text-sm text-gray-600">Seller: {listing.seller?.username || 'Unknown'}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Shipping Address -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
			<Truck class="w-5 h-5" />
			Shipping Address
		</h3>
		<div class="space-y-4">
			<input
				value={shippingAddress.name}
				oninput={(e) => onShippingAddressChange('name', e.currentTarget.value)}
				placeholder="Full Name"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
				required
			/>
			<input
				value={shippingAddress.address_line1}
				oninput={(e) => onShippingAddressChange('address_line1', e.currentTarget.value)}
				placeholder="Address Line 1"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
				required
			/>
			<input
				value={shippingAddress.address_line2}
				oninput={(e) => onShippingAddressChange('address_line2', e.currentTarget.value)}
				placeholder="Address Line 2 (Optional)"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
			/>
			<div class="grid grid-cols-2 gap-4">
				<input
					value={shippingAddress.city}
					oninput={(e) => onShippingAddressChange('city', e.currentTarget.value)}
					placeholder="City"
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
					required
				/>
				<input
					value={shippingAddress.state}
					oninput={(e) => onShippingAddressChange('state', e.currentTarget.value)}
					placeholder="State/Province"
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
					required
				/>
			</div>
			<input
				value={shippingAddress.postal_code}
				oninput={(e) => onShippingAddressChange('postal_code', e.currentTarget.value)}
				placeholder="Postal Code"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
				required
			/>
		</div>
	</div>

	<!-- Price Breakdown -->
	<div class="bg-blue-50 rounded-xl p-4">
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span>Item Price</span>
				<span class="font-medium">{formatCurrency(itemPrice)}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span>Shipping</span>
				<span class="font-medium">{shippingCost > 0 ? formatCurrency(shippingCost) : 'Free'}</span>
			</div>
			<div class="flex justify-between text-sm text-gray-600">
				<span>Buyer Protection (5% + $1)</span>
				<span>{formatCurrency(buyerFee)}</span>
			</div>
			<div class="border-t border-blue-100 pt-2 mt-2">
				<div class="flex justify-between font-semibold text-lg">
					<span>Total</span>
					<span class="text-blue-600">{formatCurrency(totalAmount)}</span>
				</div>
			</div>
		</div>
	</div>
</div>