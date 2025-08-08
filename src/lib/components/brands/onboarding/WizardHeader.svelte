<script lang="ts">
	import WizardProgress from '../WizardProgress.svelte';

	interface Props {
		currentStep: number;
		totalSteps: number;
		title?: string;
		subtitle?: string;
	}

	let {
		currentStep,
		totalSteps,
		title = "Turn Your Account into a Brand",
		subtitle = "Let's set up your professional brand presence on Driplo"
	}: Props = $props();
</script>

<!-- Header -->
<div class="text-center mb-8">
	<h1 class="text-4xl font-bold text-gray-900 mb-3">
		{title}
	</h1>
	<p class="text-lg text-gray-600">
		{subtitle}
	</p>
</div>

<!-- Progress Bar -->
<WizardProgress {currentStep} {totalSteps} />