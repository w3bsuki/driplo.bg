<script lang="ts">
	import { ArrowLeft, ArrowRight, Check } from 'lucide-svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		currentStep: number;
		totalSteps: number;
		canProceed: boolean;
		loading?: boolean;
		onPrevious: () => void;
		onNext: () => void;
		onComplete: () => void;
	}

	let {
		currentStep,
		totalSteps,
		canProceed,
		loading = false,
		onPrevious,
		onNext,
		onComplete
	}: Props = $props();

	function handlePrevious() {
		if (currentStep > 1) {
			onPrevious();
		}
	}

	function handleNext() {
		if (canProceed && currentStep < totalSteps) {
			onNext();
		}
	}

	function handleComplete() {
		if (!loading && canProceed) {
			onComplete();
		}
	}
</script>

<!-- Navigation Buttons -->
<div class="flex justify-between mt-8">
	<button
		onclick={handlePrevious}
		disabled={currentStep === 1}
		class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
	>
		<ArrowLeft class="w-5 h-5" />
		Previous
	</button>
	
	{#if currentStep < totalSteps}
		<button
			onclick={handleNext}
			disabled={!canProceed}
			class="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
		>
			Next
			<ArrowRight class="w-5 h-5" />
		</button>
	{:else}
		<button
			onclick={handleComplete}
			disabled={loading || !canProceed}
			class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
		>
			{#if loading}
				<Spinner size="sm" color="white" />
				Creating Brand...
			{:else}
				<Check class="w-5 h-5" />
				Create Brand Profile
			{/if}
		</button>
	{/if}
</div>