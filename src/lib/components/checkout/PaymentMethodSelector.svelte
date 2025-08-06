<script lang="ts">
	import { CreditCard, Check } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		paymentProvider: 'stripe' | 'revolut_manual';
		onProviderChange: (provider: 'stripe' | 'revolut_manual') => void;
	}

	let { paymentProvider, onProviderChange }: Props = $props();
</script>

<div class="mb-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
		<CreditCard class="w-5 h-5" />
		{m.checkout_payment_method()}
	</h3>
	
	<div class="space-y-3 mb-6">
		<!-- Stripe Card Payment -->
		<button
			onclick={() => onProviderChange('stripe')}
			class="w-full text-left border-2 rounded-lg p-4 transition-all {paymentProvider === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<CreditCard class="w-6 h-6 {paymentProvider === 'stripe' ? 'text-blue-600' : 'text-gray-600'}" />
					<div>
						<h4 class="font-semibold {paymentProvider === 'stripe' ? 'text-blue-900' : 'text-gray-900'}">{m.checkout_credit_card()}</h4>
						<p class="text-sm {paymentProvider === 'stripe' ? 'text-blue-600' : 'text-gray-600'}">{m.checkout_credit_card_desc()}</p>
					</div>
				</div>
				{#if paymentProvider === 'stripe'}
					<Check class="w-5 h-5 text-blue-600" />
				{/if}
			</div>
		</button>

		<!-- Manual Revolut Transfer -->
		<button
			onclick={() => onProviderChange('revolut_manual')}
			class="w-full text-left border-2 rounded-lg p-4 transition-all {paymentProvider === 'revolut_manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
						<span class="text-white font-bold">R</span>
					</div>
					<div>
						<h4 class="font-semibold {paymentProvider === 'revolut_manual' ? 'text-blue-900' : 'text-gray-900'}">{m.checkout_revolut_transfer()}</h4>
						<p class="text-sm {paymentProvider === 'revolut_manual' ? 'text-blue-600' : 'text-gray-600'}">{m.checkout_revolut_transfer_desc()}</p>
					</div>
				</div>
				{#if paymentProvider === 'revolut_manual'}
					<Check class="w-5 h-5 text-blue-600" />
				{/if}
			</div>
		</button>
	</div>
</div>