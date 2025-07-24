<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
		width?: string | number;
		height?: string | number;
		animation?: 'pulse' | 'wave' | 'none';
	}

	let {
		class: className,
		variant = 'text',
		width,
		height,
		animation = 'pulse',
		...restProps
	}: Props = $props();

	const variantClasses = {
		text: 'rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-none',
		rounded: 'rounded-md'
	};

	const animationClasses = {
		pulse: 'animate-pulse',
		wave: 'animate-shimmer',
		none: ''
	};

	const defaultSizes = {
		text: { height: '1em', width: '100%' },
		circular: { height: '40px', width: '40px' },
		rectangular: { height: '40px', width: '100%' },
		rounded: { height: '40px', width: '100%' }
	};

	const computedWidth = $derived(
		width || defaultSizes[variant].width
	);
	const computedHeight = $derived(
		height || defaultSizes[variant].height
	);
</script>

<div
	class={cn(
		'bg-gray-200',
		variantClasses[variant],
		animationClasses[animation],
		className
	)}
	style="width: {typeof computedWidth === 'number' ? `${computedWidth}px` : computedWidth}; height: {typeof computedHeight === 'number' ? `${computedHeight}px` : computedHeight};"
	{...restProps}
/>

<style>
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.animate-shimmer {
		background: linear-gradient(
			90deg,
			rgba(229, 231, 235, 1) 0%,
			rgba(243, 244, 246, 1) 50%,
			rgba(229, 231, 235, 1) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s ease-in-out infinite;
	}
</style>