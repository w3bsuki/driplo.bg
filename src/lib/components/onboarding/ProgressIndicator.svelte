<script lang="ts">
	import { onboarding } from '$lib/stores/onboarding.svelte';
	import { goto } from '$app/navigation';
	import { UserCircle, Plus, ShoppingBag } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	
	let showProgress = $derived(
		onboarding.progress.completed > 0 && 
		onboarding.progress.completed < onboarding.progress.total
	);
	
	const steps = [
		{
			key: 'hasCompletedProfile',
			icon: UserCircle,
			label: 'Complete Profile',
			href: '/profile/edit',
			completed: $derived(onboarding.hasCompletedProfile)
		},
		{
			key: 'hasCreatedFirstListing',
			icon: Plus,
			label: 'Create Listing',
			href: '/sell',
			completed: $derived(onboarding.hasCreatedFirstListing)
		},
		{
			key: 'hasMadeFirstPurchase',
			icon: ShoppingBag,
			label: 'Make Purchase',
			href: '/browse',
			completed: $derived(onboarding.hasMadeFirstPurchase)
		}
	];
</script>

{#if showProgress}
	<div class="onboarding-progress">
		<div class="progress-header">
			<span class="text-sm font-medium">Getting Started</span>
			<span class="text-sm text-muted-foreground">
				{onboarding.progress.completed}/{onboarding.progress.total} completed
			</span>
		</div>
		
		<div class="progress-bar">
			<div 
				class="progress-fill" 
				style="width: {onboarding.progress.percentage}%"
			/>
		</div>
		
		<div class="progress-steps">
			{#each steps as step}
				<button 
					class="step-item"
					class:completed={step.completed}
					onclick={() => goto(step.href)}
					disabled={step.completed}
				>
					<svelte:component this={step.icon} class="w-4 h-4" />
					<span>{step.label}</span>
					{#if step.completed}
						<span class="ml-auto text-xs text-green-600">✓</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.onboarding-progress {
		@apply bg-muted/50 border rounded-lg p-4 mb-4;
	}
	
	.progress-header {
		@apply flex justify-between items-center mb-3;
	}
	
	.progress-bar {
		@apply h-2 bg-muted rounded-full overflow-hidden mb-4;
	}
	
	.progress-fill {
		@apply h-full bg-primary transition-all duration-500;
	}
	
	.progress-steps {
		@apply flex flex-col gap-2;
	}
	
	.step-item {
		@apply flex items-center gap-2 text-sm p-2 rounded;
		@apply hover:bg-muted transition-colors text-left;
		@apply disabled:cursor-not-allowed;
	}
	
	.step-item.completed {
		@apply text-muted-foreground opacity-75;
	}
	
	.step-item:not(.completed):hover {
		@apply bg-muted;
	}
</style>