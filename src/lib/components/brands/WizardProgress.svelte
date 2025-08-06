<script lang="ts">
	interface Props {
		currentStep: number;
		totalSteps: number;
	}

	let { currentStep, totalSteps }: Props = $props();

	const progressPercentage = $derived((currentStep / totalSteps) * 100);
</script>

<div class="mb-8">
	<div class="flex items-center justify-between mb-2">
		<span class="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
		<span class="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
	</div>
	<div class="w-full bg-gray-200 rounded-full h-2">
		<div 
			class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
			style="width: {progressPercentage}%"
		></div>
	</div>
</div>