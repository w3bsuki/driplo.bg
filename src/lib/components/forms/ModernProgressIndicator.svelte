<script lang="ts">
	import { cn } from '$lib/utils';
	import { Check } from 'lucide-svelte';
	import { fly, scale } from 'svelte/transition';

	interface Step {
		id: number;
		name: string;
		icon?: any;
		optional?: boolean;
	}

	interface Props {
		steps: Step[];
		currentStep: number;
		completedSteps?: number[];
		class?: string;
		variant?: 'horizontal' | 'vertical';
		showLabels?: boolean;
		compact?: boolean;
	}

	let {
		steps,
		currentStep,
		completedSteps = [],
		class: className,
		variant = 'horizontal',
		showLabels = true,
		compact = false
	}: Props = $props();

	// Calculate progress percentage
	const progressPercentage = $derived(() => {
		const currentIndex = steps.findIndex(step => step.id === currentStep);
		const totalSteps = steps.length;
		return ((currentIndex + 1) / totalSteps) * 100;
	});

	// Determine step status
	function getStepStatus(step: Step) {
		if (completedSteps.includes(step.id)) return 'completed';
		if (step.id === currentStep) return 'current';
		return 'upcoming';
	}

	// Step styling based on status
	function getStepClasses(step: Step) {
		const status = getStepStatus(step);
		
		return cn(
			'relative flex items-center justify-center transition-all duration-300',
			// Size
			compact ? 'w-8 h-8' : 'w-10 h-10',
			// Base styles
			'rounded-full border-2 font-medium text-sm',
			// Status-specific styles
			status === 'completed' && 'bg-primary border-primary text-primary-foreground shadow-md',
			status === 'current' && 'bg-primary border-primary text-primary-foreground shadow-lg scale-110',
			status === 'upcoming' && 'bg-background border-border text-muted-foreground',
			// Hover effects for upcoming steps
			status === 'upcoming' && 'hover:border-border/80'
		);
	}

	// Label styling based on status
	function getLabelClasses(step: Step) {
		const status = getStepStatus(step);
		
		return cn(
			'text-xs font-medium transition-colors duration-200',
			status === 'completed' && 'text-primary',
			status === 'current' && 'text-primary font-semibold',
			status === 'upcoming' && 'text-muted-foreground',
			// Optional styling
			step.optional && 'italic'
		);
	}

	// Connection line styling
	function getLineClasses(index: number) {
		const step = steps[index];
		const nextStep = steps[index + 1];
		if (!nextStep) return '';
		
		const isCompleted = completedSteps.includes(step.id);
		const isNextCurrent = nextStep.id === currentStep;
		const isNextCompleted = completedSteps.includes(nextStep.id);
		
		return cn(
			'absolute transition-all duration-500',
			variant === 'horizontal' ? 'h-0.5 top-1/2 -translate-y-1/2' : 'w-0.5 left-1/2 -translate-x-1/2',
			// Completed connection
			(isCompleted || isNextCompleted) ? 'bg-primary' : 'bg-border',
			// Progressive fill animation
			isCompleted && isNextCurrent && 'animate-pulse'
		);
	}
</script>

<div class={cn('w-full', className)}>
	<!-- Progress Bar (overall) -->
	<div class="mb-6">
		<div class="flex items-center justify-between mb-2">
			<span class="text-sm font-medium text-card-foreground">Setup Progress</span>
			<span class="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
		</div>
		<div class="w-full bg-muted rounded-full h-2 overflow-hidden">
			<div 
				class="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
				style="width: {progressPercentage}%"
			></div>
		</div>
	</div>

	<!-- Steps -->
	<div class={cn(
		'flex',
		variant === 'horizontal' ? 'items-center justify-between' : 'flex-col space-y-4'
	)}>
		{#each steps as step, index}
			<div class={cn(
				'flex items-center',
				variant === 'horizontal' ? 'flex-col space-y-2' : 'flex-row space-x-3',
				variant === 'horizontal' && index < steps.length - 1 ? 'flex-1' : ''
			)}>
				<!-- Step Circle -->
				<div class="relative">
					<div 
						class={getStepClasses(step)}
						transition:scale={{ duration: 200, delay: index * 50 }}
					>
						{#if completedSteps.includes(step.id)}
							<Check class={cn('transition-all duration-200', compact ? 'w-4 h-4' : 'w-5 h-5')} />
						{:else if step.icon}
							<svelte:component 
								this={step.icon} 
								class={cn('transition-all duration-200', compact ? 'w-4 h-4' : 'w-5 h-5')} 
							/>
						{:else}
							<span class="font-semibold">{step.id}</span>
						{/if}
					</div>

					<!-- Connection Line -->
					{#if variant === 'horizontal' && index < steps.length - 1}
						<div 
							class={cn(
								getLineClasses(index),
								'left-full ml-2 right-0 w-full'
							)}
							style="width: calc(100% - 1rem)"
						></div>
					{:else if variant === 'vertical' && index < steps.length - 1}
						<div 
							class={cn(
								getLineClasses(index),
								'top-full mt-2 bottom-0 h-full'
							)}
							style="height: calc(100% - 0.5rem)"
						></div>
					{/if}
				</div>

				<!-- Step Label -->
				{#if showLabels}
					<div class={cn(
						'text-center',
						variant === 'horizontal' ? 'max-w-20' : 'flex-1'
					)}>
						<p class={getLabelClasses(step)}>
							{step.name}
							{#if step.optional}
								<span class="text-xs opacity-60">(optional)</span>
							{/if}
						</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px hsl(var(--primary) / 0);
		}
	}
	
	.animate-pulse-glow {
		animation: pulse-glow 2s infinite;
	}
</style>