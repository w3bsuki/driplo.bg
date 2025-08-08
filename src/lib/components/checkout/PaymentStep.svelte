<script lang="ts">
	import { CreditCard, Lock } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { formatCurrency } from '$lib/utils/currency';

	import type { Database } from '$lib/database.types';
	
	type Listing = Database['public']['Tables']['listings']['Row'];
	
	interface Props {
		listing: Listing;
		totalAmount: number;
		paymentProvider: 'stripe' | 'revolut_manual';
		onPaymentProviderChange: (provider: 'stripe' | 'revolut_manual') => void;
	}

	let { 
		listing, 
		totalAmount, 
		paymentProvider, 
		onPaymentProviderChange 
	}: Props = $props();
</script>

<!-- Step 2: Payment -->
<div class="p-6" transition:slide>
	<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
		<CreditCard class="w-5 h-5" />
		Payment Method
	</h3>

	<!-- Payment Method Selection -->
	<div class="space-y-3 mb-6">
		<label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors {paymentProvider === 'stripe' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}">
			<input
				type="radio"
				value="stripe"
				checked={paymentProvider === 'stripe'}
				onchange={() => onPaymentProviderChange('stripe')}
				class="text-blue-400"
			/>
			<div class="ml-3 flex-1">
				<p class="font-medium">Credit/Debit Card</p>
				<p class="text-sm text-gray-600">Secure payment via Stripe</p>
			</div>
			<Lock class="w-4 h-4 text-gray-400" />
		</label>
		
		<label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors {paymentProvider === 'revolut_manual' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}">
			<input
				type="radio"
				value="revolut_manual"
				checked={paymentProvider === 'revolut_manual'}
				onchange={() => onPaymentProviderChange('revolut_manual')}
				class="text-blue-400"
				disabled
			/>
			<div class="ml-3 flex-1">
				<p class="font-medium">Revolut Transfer</p>
				<p class="text-sm text-gray-600">Manual payment (temporarily disabled)</p>
			</div>
		</label>
	</div>

	{#if paymentProvider === 'stripe'}
		<!-- Card Details -->
		<div class="mb-6">
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Card Information
			</label>
			<div id="card-element-new" class="p-4 border border-gray-300 rounded-lg"></div>
		</div>
	{/if}

	<!-- Order Summary (Compact) -->
	<div class="bg-gray-50 rounded-lg p-4 mb-6">
		<div class="flex justify-between items-center">
			<div class="flex items-center gap-3">
				<img
					src={listing.images[0]}
					alt={listing.title}
					class="w-12 h-12 object-cover rounded"
				/>
				<div>
					<p class="font-medium text-sm">{listing.title}</p>
					<p class="text-xs text-gray-600">Total: {formatCurrency(totalAmount)}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Security Notice -->
	<div class="flex items-center gap-2 text-sm text-gray-600">
		<Lock class="w-4 h-4" />
		<p>Your payment information is secure and encrypted</p>
	</div>
</div>