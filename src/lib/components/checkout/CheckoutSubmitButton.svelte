<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import { LoadingSpinner } from '$lib/components/ui';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		paymentProvider: 'stripe' | 'revolut_manual';
		totalAmount: number;
		manualPaymentData?: Record<string, unknown> | null;
		isProcessing: boolean;
		showPaymentInstructions: boolean;
		onSubmit: () => void;
	}

	let {
		paymentProvider,
		totalAmount,
		manualPaymentData,
		isProcessing,
		showPaymentInstructions,
		onSubmit
	}: Props = $props();
</script>

{#if !showPaymentInstructions}
	<button
		onclick={onSubmit}
		disabled={isProcessing}
		class="w-full bg-blue-400 text-white py-4 rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
	>
		{#if isProcessing}
			<div class="flex items-center justify-center gap-2">
				<LoadingSpinner size="sm" variant="white" />
				{m.checkout_processing()}
			</div>
		{:else if paymentProvider === 'stripe'}
			{m.checkout_pay_now({ amount: formatCurrency(totalAmount) })}
		{:else}
			{m.checkout_get_revolut_instructions({ amount: formatCurrency(manualPaymentData?.total_amount || totalAmount) })}
		{/if}
	</button>
{/if}