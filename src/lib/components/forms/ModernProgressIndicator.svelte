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
		return Math.max(0, ((currentIndex) / (totalSteps - 1)) * 100);
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
			'relative flex items-center justify-center transition-all duration-200',
			// Size
			compact ? 'w-8 h-8' : 'w-10 h-10',
			// Base styles
			'rounded-full border-2 font-medium',
			// Status-specific styles
			status === 'completed' && 'bg-primary border-primary text-primary-foreground',
			status === 'current' && 'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20',
			status === 'upcoming' && 'bg-muted border-muted-foreground/30 text-muted-foreground'
		);
	}

	// Label styling based on status
	function getLabelClasses(step: Step) {
		const status = getStepStatus(step);
		
		return cn(
			'text-xs transition-colors duration-200',
			status === 'completed' && 'text-foreground font-medium',
			status === 'current' && 'text-foreground font-semibold',
			status === 'upcoming' && 'text-muted-foreground',
			// Optional styling
			step.optional && 'opacity-75'
		);
	}

	// Connection line styling
	function isLineCompleted(index: number) {
		const step = steps[index];
		return completedSteps.includes(step.id);
	}
</script>

<div class={cn('w-full', className)}>
	{#if !compact}
		<!-- Progress Bar (overall) -->
		<div class="mb-4">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-medium">Progress</span>
				<span class="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
			</div>
			<div class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
				<div 
					class="h-full bg-primary transition-all duration-500 ease-out"
					style="width: {progressPercentage}%"
				></div>
			</div>
		</div>
	{/if}

	<!-- Steps -->
	<div class={cn(
		'relative flex',
		variant === 'horizontal' ? 'items-center justify-between' : 'flex-col space-y-4',
		showLabels && variant === 'horizontal' ? 'mb-8' : ''
	)}>
		{#each steps as step, index}
			<div class={cn(
				'flex items-center',
				variant === 'horizontal' ? 'flex-1' : 'flex-row space-x-3',
				index === steps.length - 1 ? 'flex-initial' : ''
			)}>
				<!-- Step Container -->
				<div class="relative flex-1">
					<!-- Connection Line (placed before circle for proper z-index) -->
					{#if variant === 'horizontal' && index < steps.length - 1}
						<div class="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 -z-10">
							<div 
								class="h-full transition-all duration-500"
								class:bg-primary={isLineCompleted(index)}
								class:bg-border={!isLineCompleted(index)}
							></div>
						</div>
					{/if}
					
					<!-- Step Circle -->
					<div class="relative z-10">
						<div class={getStepClasses(step)}>
							{#if completedSteps.includes(step.id)}
								<Check class={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
							{:else if step.icon}
								<svelte:component 
									this={step.icon} 
									class={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} 
								/>
							{:else}
								<span class="text-xs font-semibold">{index + 1}</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Step Label -->
				{#if showLabels && variant === 'horizontal'}
					<div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
						<p class={getLabelClasses(step)}>
							{step.name}
							{#if step.optional}
								<span class="opacity-60 text-[10px]"> (opt)</span>
							{/if}
						</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

