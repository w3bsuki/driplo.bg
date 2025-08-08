<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		currentStep: number;
		isProcessing: boolean;
		totalAmount: number;
		onPreviousStep: () => void;
		onNextStep: () => void;
	}

	let { 
		currentStep, 
		isProcessing, 
		totalAmount, 
		onPreviousStep, 
		onNextStep 
	}: Props = $props();
</script>

<!-- Footer -->
<div class="border-t border-gray-200 p-6 bg-gray-50">
	<div class="flex items-center justify-between">
		{#if currentStep > 1 && currentStep < 3}
			<button
				onclick={onPreviousStep}
				class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
				disabled={isProcessing}
			>
				<ChevronLeft class="w-4 h-4" />
				Back
			</button>
		{:else}
			<div></div>
		{/if}
		
		{#if currentStep < 3}
			<button
				onclick={onNextStep}
				disabled={isProcessing}
				class="px-6 py-3 bg-blue-400 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
			>
				{#if isProcessing}
					<Spinner size="sm" color="white" />
				{:else if currentStep === 1}
					Continue to Payment
					<ChevronRight class="w-4 h-4" />
				{:else}
					Pay {formatCurrency(totalAmount)}
				{/if}
			</button>
		{:else}
			<button
				onclick={() => window.location.href = '/orders'}
				class="px-6 py-3 bg-blue-400 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
			>
				View Orders
			</button>
		{/if}
	</div>
</div>