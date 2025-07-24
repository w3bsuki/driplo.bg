<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: number;
		max?: number;
		class?: string;
		variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		showValue?: boolean;
		indeterminate?: boolean;
	}

	let {
		value = 0,
		max = 100,
		class: className,
		variant = 'default',
		size = 'md',
		showValue = false,
		indeterminate = false,
		...restProps
	}: Props = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

	const sizeClasses = {
		sm: 'h-1',
		md: 'h-2',
		lg: 'h-3'
	};

	const variantClasses = {
		default: 'bg-gray-600',
		primary: 'bg-blue-600',
		success: 'bg-green-600',
		warning: 'bg-yellow-600',
		danger: 'bg-red-600'
	};
</script>

<div class="w-full">
	<div
		role="progressbar"
		aria-valuenow={indeterminate ? undefined : value}
		aria-valuemin={0}
		aria-valuemax={max}
		class={cn(
			'relative w-full overflow-hidden rounded-full bg-gray-100',
			sizeClasses[size],
			className
		)}
		{...restProps}
	>
		{#if indeterminate}
			<div
				class={cn(
					'h-full w-full origin-left animate-progress-indeterminate',
					variantClasses[variant]
				)}
			/>
		{:else}
			<div
				class={cn(
					'h-full transition-all duration-300 ease-out',
					variantClasses[variant]
				)}
				style="width: {percentage}%"
			/>
		{/if}
	</div>
	{#if showValue && !indeterminate}
		<p class="mt-1 text-xs text-gray-600">{Math.round(percentage)}%</p>
	{/if}
</div>

<style>
	@keyframes progress-indeterminate {
		0% {
			transform: translateX(-100%);
		}
		50% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(100%);
		}
	}
	
	.animate-progress-indeterminate {
		animation: progress-indeterminate 2s ease-in-out infinite;
	}
</style>