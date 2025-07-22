<script lang="ts">
	import { cn } from '$lib/utils/cn'
	
	interface Props {
		class?: string
		variant?: 'default' | 'text' | 'circular' | 'rectangular'
		animation?: 'pulse' | 'wave' | 'none'
	}
	
	let { class: className, variant = 'default', animation = 'pulse' }: Props = $props()
	
	const variantClasses = {
		default: 'rounded-md',
		text: 'rounded h-4',
		circular: 'rounded-full aspect-square',
		rectangular: 'rounded-none'
	}
	
	const animationClasses = {
		pulse: 'animate-pulse',
		wave: 'animate-shimmer',
		none: ''
	}
</script>

<div 
	class={cn(
		"bg-neutral-200 dark:bg-neutral-800 will-change-opacity",
		variantClasses[variant],
		animationClasses[animation],
		className
	)}
	role="status"
	aria-label="Loading content"
>
	<span class="sr-only">Loading...</span>
</div>

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
			rgb(229 229 229) 0%,
			rgb(245 245 245) 50%,
			rgb(229 229 229) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}
	
	:global(.dark) .animate-shimmer {
		background: linear-gradient(
			90deg,
			rgb(38 38 38) 0%,
			rgb(64 64 64) 50%,
			rgb(38 38 38) 100%
		);
	}
</style>