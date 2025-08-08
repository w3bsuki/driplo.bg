<script lang="ts">
	import { X, ChevronRight } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		currentStep: number;
		onClose: () => void;
	}

	let { currentStep, onClose }: Props = $props();
</script>

<!-- Header -->
<div class="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
	<div class="flex items-center gap-4">
		<h2 class="text-xl font-bold text-gray-900">
			{#if currentStep === 1}
				{m.checkout_order_summary()}
			{:else if currentStep === 2}
				{m.checkout_payment_details()}
			{:else}
				{m.checkout_order_complete()}
			{/if}
		</h2>
		<!-- Step indicator -->
		<div class="flex items-center gap-2">
			{#each [1, 2, 3] as step}
				<div class="flex items-center">
					<div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
						step <= currentStep ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500'
					}`}>
						{step}
					</div>
					{#if step < 3}
						<ChevronRight class="w-4 h-4 text-gray-400 mx-1" />
					{/if}
				</div>
			{/each}
		</div>
	</div>
	<button
		onclick={onClose}
		class="p-2 hover:bg-gray-100 rounded-full transition-colors"
	>
		<X class="w-5 h-5 text-gray-500" />
	</button>
</div>