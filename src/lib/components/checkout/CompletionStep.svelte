<script lang="ts">
	import { Check } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { formatCurrency } from '$lib/utils/currency';

	interface OrderData {
		orderId: string;
		amount: number;
		paymentMethod: string;
		paymentInstructions?: string;
	}

	interface Props {
		orderData: OrderData | null;
	}

	let { orderData }: Props = $props();
</script>

<!-- Step 3: Order Complete -->
<div class="p-6 text-center" transition:slide>
	<div class="mb-6">
		<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
			<Check class="w-10 h-10 text-green-600" />
		</div>
		<h3 class="text-2xl font-bold text-gray-900 mb-2">Order Successful!</h3>
		<p class="text-gray-600">Your order has been placed successfully.</p>
	</div>

	{#if orderData}
		<div class="bg-gray-50 rounded-lg p-4 text-left mb-6">
			<p class="text-sm text-gray-600 mb-1">Order ID</p>
			<p class="font-mono text-sm">{orderData.orderId}</p>
			<p class="text-sm text-gray-600 mt-3 mb-1">Total Amount</p>
			<p class="font-semibold">{formatCurrency(orderData.amount)}</p>
		</div>

		{#if orderData.paymentInstructions}
			<div class="bg-blue-50 rounded-lg p-4 text-left">
				<p class="font-medium text-blue-900 mb-2">Payment Instructions</p>
				<p class="text-sm text-blue-800">{orderData.paymentInstructions}</p>
			</div>
		{/if}
	{/if}

	<p class="text-sm text-gray-600 mt-6">
		Redirecting to your orders in 3 seconds...
	</p>
</div>